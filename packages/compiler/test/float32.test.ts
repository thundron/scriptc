import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test, vi } from "vitest";
import { compile, deserializeModule, validateModule } from "../src/index.js";
import { emitLlvmModuleSource } from "../src/backend/llvm/emitter.js";

const root = join(import.meta.dirname, "../../..");
async function llvm(source: string, threaded = false): Promise<string> {
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
    if (threaded) module.workers = true;
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

test.each([false, true])(
  "vector helpers borrow stable loop arguments (threaded=%s)",
  async (threaded) => {
    const emitted = await llvm(
      `
    import {min4} from "@scriptc/experimental/f32";
    function vector(out: Float32Array, a: Float32Array, b: Float32Array, n: number): void {
      for (let i = 0; i < n; i += 4) min4(out, i, a, i, b, i);
    }
    const a = new Float32Array(16);
    vector(a, a, a, Number(process.argv[2]));
  `,
      threaded,
    );
    const body = emitted.match(
      /define internal void @sc_bf_vector(?:\.i32)?\([^\n]*\) #0 \{([\s\S]*?)\n\}/,
    )![1]!;
    expect(body).toContain("load <4 x float>");
    expect(body).toContain("store <4 x float>");
    expect(body).not.toMatch(/call .*@(scr_bytes_retain|sc_rc_release_bytes|scr_bytes_release)/);
    if (threaded) {
      expect(body).toContain("f32x4.local");
      expect(body).toContain("load atomic");
    }
  },
);

test("immutable shared inputs enable vector loads without making shared writes plain", async () => {
  const emitted = await llvm(
    `
    import {sharedReadOnly, shared, min4} from "@scriptc/experimental/f32";
    function read(handle: number, target: number): number {
      const input = sharedReadOnly(handle), output = new Float32Array(4);
      min4(output, 0, input, 0, input, 4);
      const destination = shared(target);
      destination[0] = output[0]!;
      return input[0]!;
    }
    console.log(read(Number(process.argv[2]), Number(process.argv[3])));
  `,
    true,
  );
  const body = emitted.match(
    /define internal double @sc_(?:b)?f_read(?:\.i32)?\([^\n]*\) #\d+ \{([\s\S]*?)\n\}/,
  )![1]!;
  expect(body).toContain("@scr_shared_f32_readonly_view");
  expect(body).toContain("i32 25");
  expect(body).toContain("load <4 x float>");
  expect(body).toContain("store atomic float");
  expect(body).not.toContain("@scr_arr_");
  expect(body).toMatch(/or i1/);
});

test("ordinary code narrows only proven binary32 operations at safe boundaries", async () => {
  const emitted = await llvm(`
    function sum(a: Float32Array, b: Float32Array, i: number): number {
      const x = a[i]!, y = b[i]!;
      return Math.fround(x + y);
    }
    function product(a: Float32Array, b: Float32Array, i: number): number { return Math.fround(a[i]! * b[i]!); }
    function minimum(a: Float32Array, b: Float32Array, i: number): number { return Math.min(a[i]!, b[i]!); }
    function store(out: Float32Array, a: Float32Array, b: Float32Array, i: number): void { out[i] = a[i]! + b[i]!; }
    function assigned(out: Float32Array, a: Float32Array, b: Float32Array, i: number): number { return out[i] = a[i]! + b[i]!; }
    function wide(a: Float32Array, b: Float32Array, i: number): number { return a[i]! + b[i]!; }
    function mixed(a: Float32Array, x: number): number { return Math.min(a[0]!, x); }
    function divide(a: Float32Array, b: Float32Array, i: number): number { return Math.fround(a[i]! / b[i]!); }
    function changed(a: Float32Array, x: number): number { let y = a[0]!; y = x; return Math.min(y, a[1]!); }
    const a = new Float32Array([1, 2]), i = Number(process.argv[2]);
    store(a,a,a,i);
    console.log(sum(a,a,i),product(a,a,i),minimum(a,a,i),wide(a,a,i),mixed(a,i),divide(a,a,i),changed(a,i),assigned(a,a,a,i));
  `);
  const body = (name: string): string =>
    emitted.match(
      new RegExp(
        `define internal [^\\n]+ @sc_bf_${name}(?:\\.i32)?\\([^\\n]*\\) #0 \\{([\\s\\S]*?)\\n\\}`,
      ),
    )![1]!;
  expect(body("sum")).toContain("fadd float");
  expect(body("sum")).not.toContain("fadd double");
  expect(body("product")).toContain("fmul float");
  expect(body("minimum")).toContain("@llvm.minimum.f32");
  expect(body("store")).toContain("fadd float");
  expect(body("store")).not.toContain("fadd double");
  expect(body("assigned")).toContain("fadd double");
  expect(body("wide")).toContain("fadd double");
  for (const name of ["mixed", "changed"]) expect(body(name)).toContain("@llvm.minimum.f64");
  expect(body("divide")).toContain("fdiv double");
  expect(emitted).not.toMatch(/(?:fadd|fmul) (?:fast|contract)/);
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
