import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "../../../..");
const CLI = join(REPO, "packages/cli/dist/main.js");
const FIXTURE = join(REPO, "tests/library-mode/scalars");

function hasZig(): boolean {
  try {
    execFileSync("zig", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe.runIf(hasZig())("scriptc build --lib -> wasm reactor + glue (integrated)", () => {
  it("emits .wasm + .mjs and the glue runs compiled TS", async () => {
    const dir = mkdtempSync(join(tmpdir(), "reactor-build-"));
    try {
      copyFileSync(join(FIXTURE, "lib.ts"), join(dir, "lib.ts"));
      copyFileSync(join(FIXTURE, "profile.json"), join(dir, "profile.json"));

      execFileSync("node", [CLI, "build", "--lib", "--profile", "profile.json"], {
        cwd: dir,
        env: { ...process.env, SCRIPTC_CC: "zigcc", SCRIPTC_TARGET: "wasm32-wasi" },
      });

      const glue = await import(pathToFileURL(join(dir, ".scriptc", "lib.mjs")).href);
      const { readFileSync } = await import("node:fs");
      const api = await glue.instantiateFromBytes(
        readFileSync(join(dir, ".scriptc", "lib.wasm")),
        {},
      );

      expect(api.kt_add(2, 3)).toBe(5);
      expect(api.kt_passthrough(7)).toBe(7);
      expect(api.kt_is_nan(NaN)).toBe(1);
      expect(api.kt_is_nan(1)).toBe(0);
      expect(api.kt_invert(0)).toBe(1);
      expect(api.kt_plumb(5, 100, -3)).toBe(5997);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60000);
});
