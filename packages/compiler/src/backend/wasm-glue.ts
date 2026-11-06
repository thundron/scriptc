import type { LibraryProfile } from "../library/library-profile.js";
import type { IrWasmMemory } from "../ir/ir.js";
import { emitManagedWasmRuntime } from "./wasm-shared-runtime.js";
export type WasmValueClass =
  | "f64"
  | "i32"
  | "i64"
  | "u64"
  | "string"
  | "bytes"
  | "cstring"
  | "void";

export interface WasmImportSig {
  module: string;
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
  stem: string;
  imports: WasmImportSig[];
  exports: WasmExportSig[];
  initSymbol?: string;
  features?: readonly "simd128"[];
  memory?: IrWasmMemory;
  managedExports?: { name: string; symbol: string }[];
}

function isPair(c: WasmValueClass): boolean {
  return c === "string" || c === "bytes";
}

function assertResultScalar(where: string, name: string, result: WasmValueClass): void {
  if (result === "string" || result === "bytes" || result === "cstring") {
    throw new Error(
      `wasm-glue: ${where} '${name}' returns '${result}', but string/bytes results are not supported in the wasm host-import ABI (return a scalar or void, or write into a caller buffer)`,
    );
  }
}

function importParams(params: WasmValueClass[]): { wasmParams: string[]; jsArgs: string[] } {
  const wasmParams: string[] = [];
  const jsArgs: string[] = [];
  params.forEach((c, i) => {
    if (isPair(c)) {
      const p = `p${i}`;
      const l = `l${i}`;
      wasmParams.push(p, l);
      jsArgs.push(c === "string" ? `readStr(${p}, ${l})` : `readBytes(${p}, ${l})`);
    } else if (c === "cstring") {
      const p = `p${i}`;
      wasmParams.push(p);
      jsArgs.push(`readCstr(${p})`);
    } else if (c === "void") {
    } else {
      const a = `a${i}`;
      wasmParams.push(a);
      jsArgs.push(a);
    }
  });
  return { wasmParams, jsArgs };
}

function exportArgs(params: WasmValueClass[]): {
  jsParams: string[];
  pre: string[];
  wasmArgs: string[];
} {
  const jsParams: string[] = [];
  const pre: string[] = [];
  const wasmArgs: string[] = [];
  params.forEach((c, i) => {
    if (c === "void") return;
    const a = `a${i}`;
    jsParams.push(a);
    if (isPair(c)) {
      const p = `p${i}`;
      const l = `l${i}`;
      pre.push(`const [${p}, ${l}] = ${c === "string" ? "passStr" : "passBytes"}(${a});`);
      wasmArgs.push(p, l);
      pre.push(`staged.push([${p}, ${l}]);`);
    } else if (c === "cstring") {
      const p = `p${i}`,
        l = `l${i}`;
      pre.push(`const [${p}, ${l}] = passCstr(${a});`, `staged.push([${p}, ${l}]);`);
      wasmArgs.push(p);
    } else {
      wasmArgs.push(a);
    }
  });
  return { jsParams, pre, wasmArgs };
}

function emitImportGroup(module: string, sigs: WasmImportSig[]): string {
  const entries = sigs.map((sig) => {
    assertResultScalar("import", sig.name, sig.result);
    const { wasmParams, jsArgs } = importParams(sig.params);
    const call = `host[${JSON.stringify(sig.name)}](${jsArgs.join(", ")})`;
    const body = sig.result === "void" ? `${call};` : `return ${call};`;
    return `      ${JSON.stringify(sig.name)}: (${wasmParams.join(", ")}) => { ${body} },`;
  });
  if (module === "scriptc") {
    entries.unshift(
      `      "panic": (p, l) => { const message = readStr(p, l); if (host.panic) return host.panic(message); throw new Error(message); },`,
    );
  }
  return `    ${JSON.stringify(module)}: {\n${entries.join("\n")}\n    },`;
}

function emitExportWrapper(sig: WasmExportSig, shared = false): string {
  const { jsParams, pre, wasmArgs } = exportArgs(sig.params);
  const pair = isPair(sig.result);
  const staged = pre.length > 0 || pair;
  const lines = [`    ${JSON.stringify(sig.name)}: (${jsParams.join(", ")}) => {`];
  if (staged) lines.push("      const staged = [];", "      try {");
  const indent = staged ? "        " : "      ";
  for (const line of pre) {
    lines.push(indent + line);
  }
  if (pair) {
    lines.push(`${indent}const out = exports.scriptc_alloc(8);`, `${indent}staged.push([out, 8]);`);
    lines.push(
      `${indent}exports[${JSON.stringify(sig.name)}](${[...wasmArgs, "out", "out + 4"].join(", ")});`,
    );
    lines.push(`${indent}const result = new DataView(exports.memory.buffer);`);
    lines.push(
      `${indent}const p = result.getUint32(out, true), l = result.getUint32(out + 4, true);`,
    );
    lines.push(
      `${indent}return ${sig.result === "string" ? "readStr(p, l)" : shared ? "readBytes(p, l)" : "readBytes(p, l).slice()"};`,
    );
  } else {
    const call = `exports[${JSON.stringify(sig.name)}](${wasmArgs.join(", ")})`;
    lines.push(
      `${indent}${sig.result === "void" ? "" : "return "}${sig.result === "cstring" ? `readCstr(${call})` : sig.result === "u64" ? `BigInt.asUintN(64, ${call})` : call};`,
    );
  }
  if (staged)
    lines.push(
      "      } finally {",
      "        for (let i = staged.length - 1; i >= 0; i--) freeStaged(staged[i][0], staged[i][1]);",
      "      }",
    );
  lines.push("    },");
  return lines.join("\n");
}

export function emitWasmGlue(mod: WasmGlueModule): string {
  const groups = new Map<string, WasmImportSig[]>([["scriptc", []]]);
  for (const imp of mod.imports) {
    const g = groups.get(imp.module);
    if (g) g.push(imp);
    else groups.set(imp.module, [imp]);
  }
  const importGroups = [...groups.entries()].map(([m, s]) => emitImportGroup(m, s)).join("\n");
  const initSym = mod.initSymbol;
  const initCall =
    initSym === undefined
      ? ""
      : `exports[${JSON.stringify(initSym)}] && exports[${JSON.stringify(initSym)}]();`;
  const exportWrappers = mod.exports
    .map((sig) => emitExportWrapper(sig, mod.memory?.shared === true))
    .join("\n");
  const simd = mod.features?.includes("simd128") === true;
  const required = [
    ...(simd ? ["simd128"] : []),
    ...(mod.memory?.shared === true ? ["threads"] : []),
  ];
  const featureInfo =
    required.length > 0 || mod.memory !== undefined
      ? `export const requiredFeatures = Object.freeze(${JSON.stringify(required)});`
      : "";
  const memoryInfo =
    mod.memory === undefined
      ? ""
      : `export const memoryABI = Object.freeze(${JSON.stringify(mod.memory)});`;
  const featureCheck = simd
    ? `  if (!WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,23,1,21,0,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,11]))) throw new Error("this library requires WebAssembly SIMD128; use its scalar build on this host");\n`
    : "";

  return `// AUTO-GENERATED by scriptc. Do not edit.
const td = new TextDecoder();
const te = new TextEncoder();
${featureInfo}
${memoryInfo}
function bindHost(host, getExports) {
  let exports;
  const mem = () => new Uint8Array(exports.memory.buffer);
  const readBytes = (ptr, len) => {
    ptr >>>= 0; len >>>= 0;
    const bytes = mem();
    if (ptr > bytes.length || len > bytes.length - ptr) throw new RangeError("wasm byte span is outside memory");
    return bytes.${mod.memory?.shared === true ? "slice" : "subarray"}(ptr, ptr + len);
  };
  const readStr = (ptr, len) => td.decode(readBytes(ptr, len));
  const readCstr = (ptr) => {
    ptr >>>= 0;
    const bytes = mem(), end = bytes.indexOf(0, ptr);
    if (ptr >= bytes.length || end < 0) throw new RangeError("wasm cstring is outside memory or unterminated");
    return td.decode(bytes.${mod.memory?.shared === true ? "slice" : "subarray"}(ptr, end));
  };
  const passStr = (s) => {
    const b = te.encode(s);
    const p = exports.scriptc_alloc(b.length);
    mem().set(b, p);
    return [p, b.length];
  };
  const passBytes = (u8) => {
    const p = exports.scriptc_alloc(u8.length);
    mem().set(u8, p);
    return [p, u8.length];
  };
  const passCstr = (text) => {
    if (text.includes("\\0")) throw new TypeError("cstring cannot contain NUL");
    const bytes = te.encode(text), size = bytes.length + 1;
    const ptr = exports.scriptc_alloc(size);
    mem().set(bytes, ptr); mem()[ptr + bytes.length] = 0;
    return [ptr, size];
  };
  const freeStaged = (p, l) => { exports.scriptc_free && exports.scriptc_free(p, l); };

  const wasiShim = new Proxy({
    environ_sizes_get: (count, size) => {
      const dv = new DataView(exports.memory.buffer);
      dv.setUint32(count, 0, true);
      dv.setUint32(size, 0, true);
      return 0;
    },
    environ_get: () => 0,
    clock_time_get: (_clock, _precision, time) => {
      new DataView(exports.memory.buffer).setBigUint64(time, BigInt(Date.now()) * 1000000n, true);
      return 0;
    },
    fd_fdstat_get: (fd, stat) => {
      if (fd < 0 || fd > 2) return 8;
      const dv = new DataView(exports.memory.buffer);
      dv.setUint8(stat, 2);
      dv.setUint16(stat + 2, 0, true);
      dv.setBigUint64(stat + 8, 0xffffffffffffffffn, true);
      dv.setBigUint64(stat + 16, 0xffffffffffffffffn, true);
      return 0;
    },
    fd_fdstat_set_flags: (fd) => fd >= 0 && fd <= 2 ? 0 : 8,
    fd_prestat_get: () => 8,
    fd_prestat_dir_name: () => 8,
    fd_read: (fd, _iov, _cnt, nread) => {
      if (fd !== 0) return 8;
      new DataView(exports.memory.buffer).setUint32(nread, 0, true);
      return 0;
    },
    fd_seek: () => 8,
    fd_close: (fd) => fd >= 0 && fd <= 2 ? 0 : 8,
    path_open: () => 76,
    fd_write: (fd, iov, cnt, nwritten) => {
      if (fd !== 1 && fd !== 2) return 8;
      const dv = new DataView(exports.memory.buffer);
      let s = "", total = 0;
      for (let i = 0; i < cnt; i++) {
        const p = dv.getUint32(iov + i * 8, true), l = dv.getUint32(iov + i * 8 + 4, true);
        s += readStr(p, l); total += l;
      }
      dv.setUint32(nwritten, total, true);
      if (s.charCodeAt(s.length - 1) === 10) s = s.slice(0, -1);
      (fd === 2 ? console.error : console.log)(s);
      return 0;
    },
    random_get: (p, l) => {
      if (!globalThis.crypto || !globalThis.crypto.getRandomValues) return 52;
      const b = ${mod.memory?.shared === true ? "new Uint8Array(l)" : "mem().subarray(p, p + l)"};
      for (let i = 0; i < b.length; i += 65536) globalThis.crypto.getRandomValues(b.subarray(i, i + 65536));
      ${mod.memory?.shared === true ? "mem().set(b,p);" : ""}
      return 0;
    },
    proc_exit: (c) => { throw new Error("wasm proc_exit(" + c + ")"); },
  }, { get: (t, k) => (k in t ? t[k] : () => 52) });

  const importObject = {
    wasi_snapshot_preview1: wasiShim,
${importGroups}
  };
  const finish = (${mod.memory === undefined ? "instance" : "instance, initialize = true"}) => {
    exports = instance.exports;
    ${mod.memory === undefined ? "" : "if (initialize) {"}
    exports._initialize && exports._initialize();
    ${initCall}
    ${mod.memory === undefined ? "" : "}"}
    return {
      __memory: () => exports.memory.buffer,
${exportWrappers}
    };
  };
  return { importObject, finish };
}

export async function instantiateFromBytes(bytes, host) {
${
  mod.memory === undefined
    ? featureCheck +
      `  const { importObject, finish } = bindHost(host);
  const { instance } = await WebAssembly.instantiate(bytes, importObject);
  return finish(instance);`
    : `  return createRuntime(bytes, host);`
}
}

export async function instantiate(host, url = new URL(${JSON.stringify(mod.stem + ".wasm")}, import.meta.url)) {
  const bytes = await (await fetch(url)).arrayBuffer();
  return instantiateFromBytes(bytes, host);
}
${emitManagedWasmRuntime(mod)}`;
}

function libraryClass(value: string): WasmValueClass {
  if (
    value === "f64" ||
    value === "void" ||
    value === "bytes" ||
    value === "string" ||
    value === "cstring" ||
    value === "i64" ||
    value === "u64"
  )
    return value;
  if (value === "bool" || value === "u8" || value === "u32" || value === "i32") return "i32";
  throw new Error(`wasm-glue: ABI class '${value}' is not supported`);
}

function libraryWasmGlueModule(profile: LibraryProfile, stem: string): WasmGlueModule {
  return {
    stem,
    initSymbol: profile.initSymbol,
    ...(profile.wasmFeatures === undefined ? {} : { features: profile.wasmFeatures }),
    ...(profile.wasmMemory === undefined
      ? {}
      : {
          memory: profile.wasmMemory,
          managedExports: profile.exports.map((entry) => ({
            name: entry.export,
            symbol: entry.symbol,
          })),
        }),
    imports: profile.callbacks.map((callback) => ({
      module: "scriptc",
      name: callback.name,
      params: callback.params.map(libraryClass),
      result: libraryClass(callback.returns),
    })),
    exports: profile.exports.map((entry) => ({
      name: entry.symbol,
      params: entry.params.map(libraryClass),
      result: libraryClass(entry.returns),
    })),
  };
}

export function emitLibraryWasmGlue(profile: LibraryProfile, stem: string): string {
  return emitWasmGlue(libraryWasmGlueModule(profile, stem));
}

function jsType(value: WasmValueClass, owned = false): string {
  if (value === "void") return "void";
  if (value === "bytes") return owned ? "Uint8Array<ArrayBuffer>" : "Uint8Array";
  if (value === "string" || value === "cstring") return "string";
  if (value === "i64" || value === "u64") return "bigint";
  return "number";
}

export function emitLibraryWasmTypes(profile: LibraryProfile, stem: string): string {
  const mod = libraryWasmGlueModule(profile, stem);
  const managed = mod.memory !== undefined;
  const host = `export interface WasmHost {\n  panic?: (message:string)=>void;\n${mod.imports.map((i) => `  ${JSON.stringify(i.name)}: (${i.params.map((p, n) => `a${n}: ${jsType(p)}`).join(", ")})=>${jsType(i.result)};`).join("\n")}\n}`;
  const features =
    mod.features?.includes("simd128") || managed
      ? 'export declare const requiredFeatures: readonly ("simd128"|"threads")[];\n'
      : "";
  const hostArg = `host${mod.imports.length ? "" : "?"}: WasmHost`;
  if (!managed)
    return `// AUTO-GENERATED by scriptc. Do not edit.
${features}${host}
export interface WasmLibrary {
  __memory(): ArrayBufferLike;
${mod.exports.map((e) => `  ${JSON.stringify(e.name)}(${e.params.map((p, n) => `a${n}: ${jsType(p)}`).join(", ")}):${jsType(e.result, true)};`).join("\n")}
}
export declare function instantiateFromBytes(bytes:BufferSource,${hostArg}):Promise<WasmLibrary>;
export declare function instantiate(${hostArg},url?:string|URL):Promise<WasmLibrary>;
`;
  const methods = profile.exports
    .map(
      (e) =>
        `  ${JSON.stringify(e.export)}: {args:[${e.params.map((p) => (jsType(libraryClass(p)) === "number" ? "number|WasmSharedBuffer" : jsType(libraryClass(p)))).join(", ")}]; result:${jsType(libraryClass(e.returns), true)}};`,
    )
    .join("\n");
  return `// AUTO-GENERATED by scriptc. Do not edit.
${features}${host}
export declare const memoryABI: Readonly<{shared:boolean; initialPages:number; maximumPages:number; stackBytes:number}>;
export interface WasmSharedBuffer {
  readonly handle:number;
  readonly length:number;
  writeFloat32(values:Float32Array,offset?:number):void;
  readFloat32(offset?:number,length?:number):Float32Array<ArrayBuffer>;
  writeUint32(values:Uint32Array,offset?:number):void;
  readUint32(offset?:number,length?:number):Uint32Array<ArrayBuffer>;
  release():void;
}
export interface WasmJobOptions {signal?:AbortSignal;timeoutMs?:number;}
export interface WasmManagedExports {
${methods}
}
export interface WasmManagedRuntime {
  readonly memoryBytes:number;
  readonly capabilities:Readonly<{mode:"scalar"|"threads";sharedMemory:boolean;simd:boolean;workers:number}>;
  buffer(length:number):WasmSharedBuffer;
  call<K extends keyof WasmManagedExports>(name:K,args:WasmManagedExports[K]["args"],options?:WasmJobOptions):Promise<WasmManagedExports[K]["result"]>;
  close():Promise<void>;
}
export interface WasmRuntimeOptions {
  workers?:number;
  timeoutMs?:number;
  startupTimeoutMs?:number;
  maxQueuedJobs?:number;
  workerHostModule?:string|URL;
  fallback?:(reason:string)=>WasmManagedRuntime|Promise<WasmManagedRuntime>;
}
export declare function createRuntime(bytes:BufferSource|WebAssembly.Module,${hostArg},options?:WasmRuntimeOptions):Promise<WasmManagedRuntime>;
export declare function instantiateFromBytes(bytes:BufferSource|WebAssembly.Module,${hostArg}):Promise<WasmManagedRuntime>;
export declare function instantiate(${hostArg},url?:string|URL):Promise<WasmManagedRuntime>;
`;
}
