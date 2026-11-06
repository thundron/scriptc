import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test, vi } from "vitest";
import { compile, deserializeModule, validateModule } from "../src/index.js";
import { emitLlvmModuleSource } from "../src/backend/llvm/emitter.js";

const root = join(import.meta.dirname, "../../..");
async function llvm(source: string): Promise<string> {
  const parent = join(root, ".scriptc");
  await mkdir(parent, { recursive: true });
  const dir = await mkdtemp(join(parent, "float32-test-"));
  try {
    const entry = join(dir, "main.ts"),
      out = join(dir, "main.ir.json");
    await writeFile(entry, source);
    const result = await compile(entry, {
      outDir: dir,
      outPath: out,
      outputKind: "ir",
      nodeIslands: { mode: "off" },
    });
    if (!result.ok)
      throw new Error(result.diagnostics.map((d) => `${d.code}: ${d.message}`).join("\n"));
    const module = deserializeModule(await readFile(out, "utf8"));
    expect(validateModule(module)).toEqual([]);
    const emitted = emitLlvmModuleSource(module, { wasi: true, pointerBits: 32 });
    return typeof emitted === "string" ? emitted : emitted.join("");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("f32 imports emit float arithmetic without changing ordinary number arithmetic", async () => {
  const emitted = await llvm(`
    import * as f32 from "@scriptc/experimental/f32";
    import {mul as product} from "@scriptc/experimental/f32";
    function single(a: number, b: number) { return f32.add(product(a,b), f32.div(a,b)); }
    function ordinary(a: number, b: number) { return a + a * b; }
    const x = Number(process.argv[2]);
    console.log(single(x, x+1), ordinary(x,x+1));
  `);
  expect(emitted).toContain("fadd float");
  expect(emitted).toContain("fmul float");
  expect(emitted).toContain("fdiv float");
  expect(emitted).toContain("fadd double");
  expect(emitted).toContain("fmul double");
  expect(emitted).not.toMatch(/(?:fadd|fmul|fdiv) (?:fast|contract)/);
  expect(emitted).not.toContain("llvm.fma");
});

test("f32 min/max use NaN-propagating signed-zero intrinsics", async () => {
  const emitted = await llvm(`
    import { min, max } from "@scriptc/experimental/f32";
    console.log(min(Number(process.argv[2]), -0), max(Number(process.argv[2]), 0));
  `);
  expect(emitted).toContain("@llvm.minimum.f32");
  expect(emitted).toContain("@llvm.maximum.f32");
});

test("matching method names on user values do not select f32 intrinsics", async () => {
  const emitted = await llvm(`
    const f32 = {add(a: number, b: number) {return a + b;}};
    console.log(f32.add(Number(process.argv[2]), 1));
  `);
  expect(emitted).toContain("fadd double");
  expect(emitted).not.toContain("fadd float");
});

test("fixed-view refusals survive recorded lowering for direct and stored vector functions", async () => {
  const parent = join(root, ".scriptc");
  await mkdir(parent, { recursive: true });
  const dir = await mkdtemp(join(parent, "float32-fixed-"));
  try {
    for (const mode of ["off", "serial"]) {
      vi.stubEnv("SCRIPTC_LOWER_JOURNAL", mode);
      for (const stored of [false, true]) {
        const entry = join(dir, `mutable-${mode}-${stored}.js`);
        await writeFile(
          entry,
          `import {add4} from "@scriptc/experimental/f32";const buffer=new ArrayBuffer(64,{maxByteLength:128});const a=new Float32Array(buffer);${stored ? "const vector=add4;" : ""}function work(){${stored ? "vector" : "add4"}(a,0,a,0,a,0);}buffer.resize(32);work();`,
        );
        const result = await compile(entry, {
          outDir: dir,
          outputKind: "ir",
          nodeIslands: { mode: "off" },
        });
        expect(result.ok).toBe(false);
        if (!result.ok)
          expect(
            result.diagnostics.some(
              (d) => d.code === "SC1090" && d.message.includes("resize or detach"),
            ),
          ).toBe(true);
      }
    }
  } finally {
    vi.unstubAllEnvs();
    await rm(dir, { recursive: true, force: true });
  }
});
