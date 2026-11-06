import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { compile, deserializeModule, validateModule } from "../src/index.js";
import { nativeCodegenTarget } from "../src/backend/targets.js";

const exec = promisify(execFile);
const target = nativeCodegenTarget();
const runtime = target
  ? join(
      import.meta.dirname,
      "../../..",
      "packages",
      target.runtimePackPackage.replace("@scriptc/", ""),
      "runtime-pack.json",
    )
  : null;
const canExecute =
  process.env["SCRIPTC_PORTABLE_ONLY"] !== "1" && runtime !== null && existsSync(runtime);

test.runIf(canExecute).each(["release", "dev"] as const)(
  "static union merge execution matches Node (%s)",
  async (optimization) => {
    const dir = await mkdtemp(join(tmpdir(), "scriptc-static-union-run-"));
    try {
      const source = await readFile(
        new URL("../../../tests/corpus/finite-union-spreads.ts", import.meta.url),
        "utf8",
      );
      const entry = join(dir, "main.ts"),
        outPath = join(dir, "main" + (target?.outputSuffixes.exe ?? ""));
      await writeFile(entry, source);
      const oracle = await exec(process.execPath, [entry], {
        timeout: 60_000,
        maxBuffer: 1024 * 1024,
      });
      const result = await compile(entry, {
        outDir: dir,
        outPath,
        backend: "llvm",
        optimization,
        sanitize: process.env["SCRIPTC_SAN"] === "1",
        tier: "static-only",
        nodeIslands: { mode: "off" },
      });
      if (!result.ok)
        throw new Error(result.diagnostics.map((d) => `${d.code}: ${d.message}`).join("\n"));
      const actual = await exec(outPath, [], { timeout: 60_000, maxBuffer: 1024 * 1024 });
      expect(actual.stdout).toBe(oracle.stdout);
      expect(actual.stderr).toBe(oracle.stderr);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
  60_000,
);

const sources = {
  optional: `type Sofa = {seats?: number; depth?: number}; type Bed = {width?: number; head?: string};
function merge(a: Sofa | Bed | undefined, b: Sofa | Bed) { return {...(a ?? {}), ...b}; }
console.log(JSON.stringify(merge({seats: 2}, {width: 160})));`,
  product: `type A = {left: number} | {right: string}; type B = {top: boolean} | {bottom: number};
function merge(a: A, b: B) { return {...a, ...b}; }
console.log(JSON.stringify(merge({left: 2}, {bottom: 3})));`,
  discriminated: `type A = {kind: 'a'; x: number} | {kind: 'b'; y: string}; type B = {size: 's'; z: boolean} | {size: 'm'; w: number};
let count = 0; function tick(): number { return ++count; }
function merge(a: A, b: B) { return {before: tick(), ...a, mid: tick(), ...b, after: tick()}; }
console.log(JSON.stringify(merge({kind:'a', x: 2}, {size:'m', w:3})));`,
  conditional: `function merge(a: boolean, b: boolean) { return {...(a ? {x: 1} : {y: 'r'}), ...(b ? {top: true} : {bottom: 3})}; }
console.log(JSON.stringify(merge(true, false)));`,
  overwrite: `type A = {x: number} | {y: number}; type B = {x: string} | {z: boolean};
function merge(a: A, b: B) { return {...a, ...b}; }
console.log(JSON.stringify(merge({x: 2}, {x:'last'})));`,
};

const programs: [string, string | null][] = [...Object.entries(sources), ["effects", null]];

const refused = {
  index: `type A = Record<string, number> | {y: number}; type B = {x: string} | {z: boolean}; function merge(a: A, b: B) { return {...a, ...b}; } console.log(JSON.stringify(merge({y: 1}, {z: false})));`,
  accessor: `type A = {get x(): number} | {get y(): number}; type B = {top: boolean} | {bottom: number}; function merge(a: A, b: B) { return {...a, ...b}; } console.log(JSON.stringify(merge({get x() {return 1;}}, {top: true})));`,
  prototype: `type A = {x: number} | {y: number}; type B = {top: boolean} | {bottom: number}; function merge(a: A, b: B) { return {...a, ...b, __proto__: {extra: 1}}; } console.log(JSON.stringify(merge({x: 1}, {top: true})));`,
};
test.each(Object.entries(refused))(
  "%s spreads retain explicit static refusals",
  async (_name, source) => {
    const dir = await mkdtemp(join(tmpdir(), "scriptc-union-spread-fence-"));
    try {
      const entry = join(dir, "main.ts");
      await writeFile(entry, source);
      const result = await compile(entry, {
        outDir: dir,
        outputKind: "ir",
        tier: "static-only",
        nodeIslands: { mode: "off" },
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.diagnostics.some((d) => d.code === "SC9001")).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
);
test.each(programs)("%s union spreads stay native in static-only builds", async (_name, input) => {
  const source =
    input ??
    (await readFile(
      new URL("../../../tests/corpus/finite-union-spreads.ts", import.meta.url),
      "utf8",
    ));
  const dir = await mkdtemp(join(tmpdir(), "scriptc-union-spread-"));
  try {
    const entry = join(dir, "main.ts"),
      outPath = join(dir, "main.ir.json");
    await writeFile(entry, source);
    const result = await compile(entry, {
      outDir: dir,
      outPath,
      outputKind: "ir",
      tier: "static-only",
      nodeIslands: { mode: "off" },
    });
    if (!result.ok)
      throw new Error(result.diagnostics.map((d) => `${d.code}: ${d.message}`).join("\n"));
    const text = await readFile(outPath, "utf8"),
      mod = deserializeModule(text);
    expect(validateModule(mod)).toEqual([]);
    expect(text).not.toMatch(/"fn":\s*"dyn\.(?:spreadOwn|newObj|set|setKey|dataSet|defineOwn)/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
