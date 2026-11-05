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
  try {
    execFileSync("zig", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
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

      const mod = new wasmApi.Module(readFileSync(join(dir, ".scriptc", "lib.wasm")));
      const state: { memory: WasmMemory | null } = { memory: null };
      const wasi = new Proxy<Record<string, (...args: number[]) => number>>(
        {},
        { get: () => () => 0 },
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
        kc_init: () => void;
        kc_up: (index: number) => number;
        kc_lo: (index: number) => number;
      };
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
