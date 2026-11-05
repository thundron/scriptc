import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { compile } from "@scriptc/compiler";

const hasZig = spawnSync("zig", ["version"]).status === 0;
test.each(["native", ...(hasZig ? ["wasi"] : [])])(
  "source-only workspace declaration twins run Node-exactly (%s)",
  async (target) => {
    const dir = await mkdtemp(join(tmpdir(), "scriptc-workspace-twins-"));
    const before = process.env["SCRIPTC_TARGET"];
    try {
      const source = join(dir, "packages/source"),
        barrel = join(dir, "packages/barrel");
      await mkdir(source, { recursive: true });
      await mkdir(barrel, { recursive: true });
      await mkdir(join(dir, "node_modules/@fixture"), { recursive: true });
      await writeFile(join(dir, "package.json"), '{"type":"module"}');
      for (const [name, path] of [
        ["source", source],
        ["barrel", barrel],
      ]) {
        await writeFile(
          join(path!, "package.json"),
          JSON.stringify({
            name: `@fixture/${name}`,
            type: "module",
            main: "index.ts",
            types: "index.ts",
            exports: { ".": "./index.ts" },
          }),
        );
        await symlink(path!, join(dir, `node_modules/@fixture/${name}`));
      }
      await writeFile(join(source, "index.ts"), 'export { answer } from "./generated.js";');
      await writeFile(join(source, "generated.js"), "export function answer(x) { return x + 1; }");
      await writeFile(
        join(source, "generated.d.ts"),
        "export declare function answer(x: number): number;",
      );
      await writeFile(join(barrel, "index.ts"), 'export { answer } from "@fixture/source";');
      const entry = join(dir, "main.ts");
      await writeFile(entry, 'import { answer } from "@fixture/barrel"; console.log(answer(41));');
      const expected = execFileSync(process.execPath, [entry], { encoding: "utf8" });
      if (target === "wasi") process.env["SCRIPTC_TARGET"] = "wasm32-wasi";
      else delete process.env["SCRIPTC_TARGET"];
      const result = await compile(entry, {
        backend: "llvm",
        outDir: dir,
        sanitize: false,
        outPath: join(dir, target === "wasi" ? "program.wasm" : "program"),
      });
      if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
      const actual =
        target === "native"
          ? execFileSync(result.binaryPath, { encoding: "utf8" })
          : execFileSync(
              process.execPath,
              [
                "--disable-warning=ExperimentalWarning",
                "--input-type=module",
                "-e",
                `import{WASI}from'node:wasi';import{readFileSync}from'node:fs';const wasi=new WASI({version:'preview1',args:["fixture"],env:{},returnOnExit:true});const instance=new WebAssembly.Instance(new WebAssembly.Module(readFileSync(${JSON.stringify(result.binaryPath)})),wasi.getImportObject());wasi.start(instance);`,
              ],
              { encoding: "utf8" },
            );
      expect(actual).toBe(expected);
    } finally {
      if (before === undefined) delete process.env["SCRIPTC_TARGET"];
      else process.env["SCRIPTC_TARGET"] = before;
      await rm(dir, { recursive: true, force: true });
    }
  },
);
