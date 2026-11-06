import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "vitest";
import { compile, deserializeModule, serializeModule, validateModule } from "../src/index.js";
import type { IrLibSection, IrWasmMemory } from "../src/ir/ir.js";
import { emitLlvmModuleSource } from "../src/backend/llvm/emitter.js";
import { wasmMemoryLinkFlags } from "../src/backend/wasm-library.js";

const parent = join(import.meta.dirname, "../../../.scriptc");
test("serialized IR cannot forge a shared-memory contract or unsafe memory bounds", async () => {
  await mkdir(parent, { recursive: true });
  const dir = await mkdtemp(join(parent, "wasm-memory-"));
  try {
    const entry = join(dir, "main.ts"),
      out = join(dir, "main.ir.json");
    await writeFile(entry, "let count=1; count++; console.log(count);\n");
    const result = await compile(entry, {
      outDir: dir,
      outPath: out,
      outputKind: "ir",
      nodeIslands: { mode: "off" },
    });
    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const module = deserializeModule(await readFile(out, "utf8"));
    const lib: IrLibSection = {
      profileName: "memory",
      prefix: "m_",
      initSymbol: "m_init",
      sinkRegisterSymbol: "m_sink",
      collectSymbol: "m_collect",
      resultResetSymbol: null,
      threadInstances: true,
      exports: [],
      trapOverlays: [],
    };
    const memory: IrWasmMemory = {
      shared: true,
      initialPages: 256,
      maximumPages: 4096,
      stackBytes: 1048576,
    };
    module.lib = { ...lib, wasmMemory: memory };
    expect(validateModule(deserializeModule(serializeModule(module)))).toEqual([]);
    const output = emitLlvmModuleSource(module, { wasi: true, pointerBits: 32 });
    const text = typeof output === "string" ? output : output.join("");
    expect(text).toContain("+atomics,+bulk-memory,+mutable-globals");
    expect(text).toContain("define void @scriptc_thread_dispose");
    for (const patch of [
      { shared: false },
      { shared: "yes" },
      { initialPages: 1 },
      { initialPages: NaN },
      { maximumPages: 255 },
      { maximumPages: 65537 },
      { stackBytes: 65535 },
      { stackBytes: 65537 },
      { stackBytes: 16777216 },
    ]) {
      module.lib = { ...lib, wasmMemory: { ...memory, ...patch } as IrWasmMemory };
      const parsed = deserializeModule(serializeModule(module));
      expect(
        validateModule(parsed).some((e) =>
          e.message.includes("invalid library wasm memory contract"),
        ),
      ).toBe(true);
    }
    module.lib = { ...lib, threadInstances: false, wasmMemory: { ...memory, shared: false } };
    expect(validateModule(module)).toEqual([]);
    expect(wasmMemoryLinkFlags()).toEqual([]);
    expect(wasmMemoryLinkFlags(memory)).toContain("-matomics");
    expect(wasmMemoryLinkFlags(memory)).toContain("-Wl,--shared-memory");
    expect(wasmMemoryLinkFlags({ ...memory, shared: false })).not.toContain("-nostdlib");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
