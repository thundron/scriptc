import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { wasmApi } from "./wasm-test-api.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "../../../..");
const CLI = join(REPO, "packages/cli/dist/main.js");
const FIXTURE = join(REPO, "tests/library-mode/callbacks");

function hasZig(): boolean {
  try {
    execFileSync("zig", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe.runIf(hasZig())("wasm host imports (library callbacks -> wasm imports)", () => {
  it("compiled TS calls host JS with strings/bytes and receives returns", async () => {
    const dir = mkdtempSync(join(tmpdir(), "wasm-host-imports-"));
    try {
      copyFileSync(join(FIXTURE, "lib.ts"), join(dir, "lib.ts"));
      // The native conformance profile is shared and keeps growing; the wasm
      // host-import ABI has no string/bytes RESULT class, so exports that
      // return one are dropped rather than assumed absent.
      const profile = JSON.parse(readFileSync(join(FIXTURE, "profile.json"), "utf8"));
      profile.exports = profile.exports.filter(
        (e: { returns: string }) => e.returns !== "string" && e.returns !== "bytes",
      );
      writeFileSync(join(dir, "profile.json"), JSON.stringify(profile, null, 2));
      execFileSync("node", [CLI, "build", "--lib", "--profile", "profile.json"], {
        cwd: dir,
        env: { ...process.env, SCRIPTC_CC: "zigcc", SCRIPTC_TARGET: "wasm32-wasi" },
      });

      const WA = wasmApi;
      const mod = new WA.Module(readFileSync(join(dir, ".scriptc", "lib.wasm")));
      const hostImports = WA.Module.imports(mod)
        .filter(
          (i: { module: string; name: string }) => i.module === "scriptc" && i.name !== "panic",
        )
        .map((i: { name: string }) => i.name);
      expect(hostImports.sort()).toEqual(["emitChunk", "mix", "note", "orphan", "progress"]);

      const glueUrl = pathToFileURL(join(dir, ".scriptc", "lib.mjs")).href;
      const glue = await import(glueUrl);
      const calls: unknown[][] = [];
      const api = await glue.instantiateFromBytes(readFileSync(join(dir, ".scriptc", "lib.wasm")), {
        emitChunk: (b: Uint8Array, seq: number) => {
          calls.push(["emitChunk", Array.from(b), seq]);
        },
        progress: (a: number, b: number) => {
          calls.push(["progress", a, b]);
          return 7;
        },
        note: (s: string, f: number) => {
          calls.push(["note", s, f]);
        },
        mix: (a: number, b: number) => {
          calls.push(["mix", a, b]);
          return 9;
        },
        orphan: (x: number) => {
          calls.push(["orphan", x]);
        },
      });

      expect(api.cb_stream(2, 3)).toBe(10);
      expect(api.cb_ask_host(5)).toBe(23);
      expect(calls).toEqual([
        ["emitChunk", [65, 51, 33], 0],
        ["note", "chunk 0 away", 0],
        ["emitChunk", [66, 52, 33], 1],
        ["note", "chunk 1 away", 1],
        ["progress", 5, 10],
        ["mix", 305, -5],
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60000);
});
