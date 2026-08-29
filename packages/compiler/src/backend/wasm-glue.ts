// Phase 3 (nativetron) — JS glue emission for the browser wasm reactor lane.
//
// A wasm reactor exposes: `memory`, `_initialize` (crt reactor hook that runs
// module ctors / one-time init), the guest allocator exports
// `scr_wasm_alloc`/`scr_wasm_free`, one export per app-exported function, and
// one import per host-provided function. This module turns the IR-derived
// import/export surface into a small ESM loader that:
//   - instantiates the module (browser: fetch the .wasm URL; or from bytes),
//   - provides the host imports, marshalling string/bytes via (ptr,len) over
//     linear memory (the exact FFI ptr+len contract, at 32-bit wasm pointers),
//   - runs `_initialize`, and
//   - returns JS wrappers for the exported functions.
//
// Pure string emission — no compiler state, no zig — so it is fully
// unit-testable and can also be exercised end-to-end against a real reactor.

/** The value classes that cross the wasm boundary. Mirrors the FFI value
 * classes; `string`/`bytes` expand to a (ptr:i32, len:i32) pair at the wasm
 * ABI level. `string`/`bytes` are NOT permitted as a return/result in this
 * first cut (host returns scalars or void), matching the FFI restriction. */
export type WasmValueClass = "f64" | "i32" | "string" | "bytes" | "void";

export interface WasmImportSig {
  /** wasm import module namespace, e.g. "nt" or "env". */
  module: string;
  /** wasm import (and host-impl) name. */
  name: string;
  params: WasmValueClass[];
  result: WasmValueClass;
}

export interface WasmExportSig {
  name: string;
  params: WasmValueClass[];
  result: WasmValueClass;
}

export interface WasmGlueModule {
  /** artifact stem; the loader fetches `<stem>.wasm` beside itself. */
  stem: string;
  imports: WasmImportSig[];
  exports: WasmExportSig[];
}

function isPair(c: WasmValueClass): boolean {
  return c === "string" || c === "bytes";
}

function assertResultScalar(where: string, name: string, result: WasmValueClass): void {
  if (result === "string" || result === "bytes") {
    throw new Error(
      `wasm-glue: ${where} '${name}' returns '${result}', but string/bytes results are not supported in the wasm host-import ABI (return a scalar or void, or write into a caller buffer)`,
    );
  }
}

/** Build the argument list an IMPORT wrapper receives from wasm, expanding
 * string/bytes into (ptr,len) params, plus the JS-side decoded arg exprs. */
function importParams(params: WasmValueClass[]): { wasmParams: string[]; jsArgs: string[] } {
  const wasmParams: string[] = [];
  const jsArgs: string[] = [];
  params.forEach((c, i) => {
    if (isPair(c)) {
      const p = `p${i}`;
      const l = `l${i}`;
      wasmParams.push(p, l);
      jsArgs.push(c === "string" ? `readStr(${p}, ${l})` : `readBytes(${p}, ${l})`);
    } else if (c === "void") {
      // no param
    } else {
      const a = `a${i}`;
      wasmParams.push(a);
      jsArgs.push(a);
    }
  });
  return { wasmParams, jsArgs };
}

/** Build the JS wrapper params for an EXPORT (host→guest) and the expanded
 * wasm-level arg exprs (staging string/bytes into linear memory). */
function exportArgs(params: WasmValueClass[]): {
  jsParams: string[];
  pre: string[];
  wasmArgs: string[];
  post: string[];
} {
  const jsParams: string[] = [];
  const pre: string[] = [];
  const wasmArgs: string[] = [];
  const post: string[] = [];
  params.forEach((c, i) => {
    if (c === "void") return;
    const a = `a${i}`;
    jsParams.push(a);
    if (isPair(c)) {
      const p = `p${i}`;
      const l = `l${i}`;
      pre.push(`const [${p}, ${l}] = ${c === "string" ? "passStr" : "passBytes"}(${a});`);
      wasmArgs.push(p, l);
      post.push(`freeStaged(${p}, ${l});`);
    } else {
      wasmArgs.push(a);
    }
  });
  return { jsParams, pre, wasmArgs, post };
}

function emitImportGroup(module: string, sigs: WasmImportSig[]): string {
  const entries = sigs.map((sig) => {
    assertResultScalar("import", sig.name, sig.result);
    const { wasmParams, jsArgs } = importParams(sig.params);
    const call = `host[${JSON.stringify(sig.name)}](${jsArgs.join(", ")})`;
    const body = sig.result === "void" ? `${call};` : `return ${call};`;
    return `      ${JSON.stringify(sig.name)}: (${wasmParams.join(", ")}) => { ${body} },`;
  });
  return `    ${JSON.stringify(module)}: {\n${entries.join("\n")}\n    },`;
}

function emitExportWrapper(sig: WasmExportSig): string {
  assertResultScalar("export", sig.name, sig.result);
  const { jsParams, pre, wasmArgs, post } = exportArgs(sig.params);
  const call = `exports[${JSON.stringify(sig.name)}](${wasmArgs.join(", ")})`;
  const lines: string[] = [];
  lines.push(`    ${JSON.stringify(sig.name)}: (${jsParams.join(", ")}) => {`);
  for (const p of pre) lines.push(`      ${p}`);
  if (sig.result === "void") {
    lines.push(`      ${call};`);
    for (const p of post) lines.push(`      ${p}`);
  } else if (post.length === 0) {
    lines.push(`      return ${call};`);
  } else {
    lines.push(`      const r = ${call};`);
    for (const p of post) lines.push(`      ${p}`);
    lines.push(`      return r;`);
  }
  lines.push(`    },`);
  return lines.join("\n");
}

/** Emit the ESM glue (`<stem>.mjs`) for a wasm reactor module. */
export function emitWasmGlue(mod: WasmGlueModule): string {
  // group imports by module namespace, preserving first-seen order
  const groups = new Map<string, WasmImportSig[]>();
  for (const imp of mod.imports) {
    const g = groups.get(imp.module);
    if (g) g.push(imp);
    else groups.set(imp.module, [imp]);
  }
  const importGroups = [...groups.entries()].map(([m, s]) => emitImportGroup(m, s)).join("\n");
  const exportWrappers = mod.exports.map(emitExportWrapper).join("\n");

  return `// AUTO-GENERATED by scriptc (nativetron wasm reactor glue). Do not edit.
// Instantiates ${JSON.stringify(mod.stem)}.wasm, wires host imports, and exposes exports.
const td = new TextDecoder();
const te = new TextEncoder();

function bindHost(host, getExports) {
  let exports;
  const mem = () => new Uint8Array(exports.memory.buffer);
  const readStr = (ptr, len) => td.decode(mem().subarray(ptr, ptr + len));
  const readBytes = (ptr, len) => mem().slice(ptr, ptr + len);
  const passStr = (s) => {
    const b = te.encode(s);
    const p = exports.scr_wasm_alloc(b.length);
    mem().set(b, p);
    return [p, b.length];
  };
  const passBytes = (u8) => {
    const p = exports.scr_wasm_alloc(u8.length);
    mem().set(u8, p);
    return [p, u8.length];
  };
  const freeStaged = (p, l) => { exports.scr_wasm_free && exports.scr_wasm_free(p, l); };

  const importObject = {
${importGroups}
  };
  const finish = (instance) => {
    exports = instance.exports;
    exports._initialize && exports._initialize();
    return {
${exportWrappers}
    };
  };
  return { importObject, finish };
}

/** Instantiate from raw wasm bytes (Node or browser). */
export async function instantiateFromBytes(bytes, host) {
  const { importObject, finish } = bindHost(host);
  const { instance } = await WebAssembly.instantiate(bytes, importObject);
  return finish(instance);
}

/** Instantiate by fetching ${JSON.stringify(mod.stem)}.wasm next to this module (browser). */
export async function instantiate(host, url = new URL(${JSON.stringify(mod.stem + ".wasm")}, import.meta.url)) {
  const bytes = await (await fetch(url)).arrayBuffer();
  return instantiateFromBytes(bytes, host);
}
`;
}
