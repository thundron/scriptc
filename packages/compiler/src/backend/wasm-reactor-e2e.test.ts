import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { wasmReactorLinkArgs } from "./native-toolchain.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "../../../..");
const CLI = join(REPO, "packages/cli/dist/main.js");
const RT = join(REPO, "packages/runtime/src");
const FIXTURE = join(REPO, "tests/library-mode/scalars");

const LIB_SOURCES = [
  "scr_number", "scr_string", "scr_array", "scr_bytes", "scr_bytes_io", "scr_map",
  "scr_closure", "scr_object", "scr_union", "scr_exception", "scr_error", "scr_console",
  "scr_lib", "scr_path", "scr_url", "scr_json", "scr_cycle", "scr_library", "scr_wasm",
];
const APP_EXPORTS = ["kt_add", "kt_passthrough", "kt_neg_zero", "kt_is_nan", "kt_invert", "kt_plumb"];
const WASI_DEFS = ["-D_GNU_SOURCE", "-D_WASI_EMULATED_SIGNAL", "-D_WASI_EMULATED_PROCESS_CLOCKS", "-D_WASI_EMULATED_GETPID"];
const WASI_LIBS = ["-lwasi-emulated-signal", "-lwasi-emulated-process-clocks", "-lwasi-emulated-getpid"];

function hasZig(): boolean {
  try { execFileSync("zig", ["version"], { stdio: "ignore" }); return true; } catch { return false; }
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

      const obj = join(dir, "obj");
      mkdirSync(obj, { recursive: true });
      execFileSync("zig", ["cc", "-target", "wasm32-wasi", "-O2", "-c",
        join(dir, ".scriptc", "lib.lib.ll"), "-o", join(obj, "prog.o")]);
      for (const s of LIB_SOURCES) {
        execFileSync("zig", ["cc", "-target", "wasm32-wasi", "-O2", "-DSCR_LIB",
          ...WASI_DEFS, "-I", RT, "-c", join(RT, `${s}.c`), "-o", join(obj, `${s}.o`)]);
      }
      const objs = ["prog.o", ...LIB_SOURCES.map((s) => `${s}.o`)].map((o) => join(obj, o));
      execFileSync("zig", ["cc", "-target", "wasm32-wasi", "-O2",
        ...wasmReactorLinkArgs(APP_EXPORTS), ...objs, ...WASI_LIBS,
        "-o", join(dir, "reactor.wasm")]);

      const WA = (globalThis as unknown as { WebAssembly: any }).WebAssembly;
      const mod = new WA.Module(readFileSync(join(dir, "reactor.wasm")));
      const inst = new WA.Instance(mod, { wasi_snapshot_preview1: new Proxy({}, { get: () => () => 0 }) });
      const ex = inst.exports;
      ex._initialize();

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
