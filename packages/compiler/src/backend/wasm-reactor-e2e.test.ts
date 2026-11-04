import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { wasmApi, type WasmMemory } from "./wasm-test-api.js";
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

describe.runIf(hasZig())("TS -> wasm reactor (end-to-end)", () => {
  it("compiled TS exports run in the reactor from JS", async () => {
    const dir = mkdtempSync(join(tmpdir(), "reactor-e2e-"));
    try {
      copyFileSync(join(FIXTURE, "lib.ts"), join(dir, "lib.ts"));
      copyFileSync(join(FIXTURE, "profile.json"), join(dir, "profile.json"));

      execFileSync("node", [CLI, "build", "--lib", "--profile", "profile.json"], {
        cwd: dir,
        env: { ...process.env, SCRIPTC_CC: "zigcc", SCRIPTC_TARGET: "wasm32-wasi" },
      });

      const mod = new wasmApi.Module(readFileSync(join(dir, ".scriptc", "lib.wasm")));
      const state: { memory: WasmMemory | null } = { memory: null };
      const logged: string[] = [];
      const wasi = new Proxy<Record<string, (...args: number[]) => number>>(
        {
          fd_write: (_fd: number, iov: number, cnt: number, nwritten: number) => {
            const memory = state.memory!;
            const dv = new DataView(memory.buffer);
            let total = 0;
            for (let i = 0; i < cnt; i++) {
              const p = dv.getUint32(iov + i * 8, true);
              const l = dv.getUint32(iov + i * 8 + 4, true);
              logged.push(Buffer.from(memory.buffer, p, l).toString());
              total += l;
            }
            dv.setUint32(nwritten, total, true);
            return 0;
          },
        },
        { get: (target, key: string) => target[key] ?? (() => 0) },
      );
      const inst = new wasmApi.Instance(mod, {
        wasi_snapshot_preview1: wasi,
        scriptc: {
          panic: (p: number, n: number) => {
            throw new Error(Buffer.from(state.memory!.buffer, p, n).toString());
          },
        },
      });
      state.memory = inst.exports.memory as WasmMemory;
      const ex = inst.exports as {
        _initialize: () => void;
        kt_init: () => void;
        kt_add: (a: number, b: number) => number;
        kt_passthrough: (value: number) => number;
        kt_neg_zero: () => number;
        kt_is_nan: (value: number) => number;
        kt_invert: (value: number) => number;
        kt_plumb: (a: number, b: number, c: number) => number;
      };
      ex._initialize();
      ex.kt_init();
      expect(logged.join("").trim()).toBe("scalars ready");

      expect(ex.kt_add(2, 3)).toBe(5);
      expect(ex.kt_passthrough(7)).toBe(7);
      expect(Object.is(ex.kt_neg_zero(), -0)).toBe(true);
      expect(ex.kt_is_nan(NaN)).toBe(1);
      expect(ex.kt_is_nan(1)).toBe(0);
      expect(ex.kt_invert(0)).toBe(1);
      expect(ex.kt_plumb(5, 100, -3)).toBe(5997);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60000);
});
