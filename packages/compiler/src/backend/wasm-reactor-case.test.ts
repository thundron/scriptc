import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "../../../..");
const CLI = join(REPO, "packages/cli/dist/main.js");
const FIXTURE = join(REPO, "tests/library-mode/case-conv");

// Node reference for the fixture's FNV-1a-over-UTF16 case mappings.
const SAMPLES = ["hello", "Ünïcödë", "straße", "ΣΊΣΥΦΟΣ", "İstanbul", "ﬀ", "Ⅷ", "HELLO", ""];
function fnv(s: string): number {
  let acc = 2166136261;
  for (let i = 0; i < s.length; i++) {
    acc = (acc ^ s.charCodeAt(i)) >>> 0;
    acc = (acc * 16777619) >>> 0;
  }
  return acc >>> 0;
}

function hasZig(): boolean {
  try { execFileSync("zig", ["version"], { stdio: "ignore" }); return true; } catch { return false; }
}

describe.runIf(hasZig())("toUpperCase/toLowerCase in the wasm reactor", () => {
  it("links scr_regex.c + libunicode and matches Node case mappings", async () => {
    const dir = mkdtempSync(join(tmpdir(), "reactor-case-"));
    try {
      copyFileSync(join(FIXTURE, "lib.ts"), join(dir, "lib.ts"));
      copyFileSync(join(FIXTURE, "profile.json"), join(dir, "profile.json"));
      execFileSync("node", [CLI, "build", "--lib", "--profile", "profile.json"], {
        cwd: dir,
        env: { ...process.env, SCRIPTC_CC: "zigcc", SCRIPTC_TARGET: "wasm32-wasi" },
      });

      const WA = (globalThis as unknown as { WebAssembly: any }).WebAssembly;
      const mod = new WA.Module(readFileSync(join(dir, ".scriptc", "lib.wasm")));
      let inst: any;
      const wasi = new Proxy({}, { get: () => () => 0 });
      inst = new WA.Instance(mod, { wasi_snapshot_preview1: wasi });
      const ex = inst.exports;
      ex._initialize();
      ex.kc_init();

      for (let i = 0; i < SAMPLES.length; i++) {
        expect(ex.kc_up(i)).toBe(fnv(SAMPLES[i]!.toUpperCase()));
        expect(ex.kc_lo(i)).toBe(fnv(SAMPLES[i]!.toLowerCase()));
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120000);
});
