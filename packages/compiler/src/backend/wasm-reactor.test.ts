import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  wasmReactorLinkArgs,
  WASM_REACTOR_SUPPORT_EXPORTS,
} from "./native-toolchain.js";

describe("wasmReactorLinkArgs (unit)", () => {
  it("emits reactor exec-model + no-entry + one --export per symbol", () => {
    const args = wasmReactorLinkArgs(["onClick", "inited"]);
    expect(args[0]).toBe("-mexec-model=reactor");
    expect(args).toContain("-Wl,--no-entry");
    expect(args).toContain("-Wl,--export=scr_wasm_alloc");
    expect(args).toContain("-Wl,--export=scr_wasm_free");
    expect(args).toContain("-Wl,--export=onClick");
    expect(args).toContain("-Wl,--export=inited");
  });

  it("does NOT --export _initialize or memory (crt/linker surface them)", () => {
    const args = wasmReactorLinkArgs(["f"]);
    expect(args).not.toContain("-Wl,--export=_initialize");
    expect(args).not.toContain("-Wl,--export=memory");
  });

  it("de-duplicates app exports overlapping the support set / each other", () => {
    const args = wasmReactorLinkArgs(["memory", "onClick", "onClick", ""]);
    const exportFlags = args.filter((a) => a.startsWith("-Wl,--export="));
    expect(new Set(exportFlags).size).toBe(exportFlags.length); // no duplicates
    expect(exportFlags).toEqual([
      "-Wl,--export=scr_wasm_alloc",
      "-Wl,--export=scr_wasm_free",
      "-Wl,--export=memory",
      "-Wl,--export=onClick",
    ]);
  });

  it("support set is the two allocator exports (memory/_initialize are implicit)", () => {
    expect([...WASM_REACTOR_SUPPORT_EXPORTS]).toEqual(["scr_wasm_alloc", "scr_wasm_free"]);
  });
});

function hasZig(): boolean {
  try {
    execFileSync("zig", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const RUNTIME_SRC = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../runtime/src/scr_wasm.c",
);

const DRIVER_C = `#include <stdint.h>
void *scr_wasm_alloc(uint32_t);
void scr_wasm_free(void *, uint32_t);
__attribute__((export_name("roundtrip")))
uint32_t roundtrip(uint32_t n){
  uint8_t *p = (uint8_t*)scr_wasm_alloc(n);
  for (uint32_t i=0;i<n;i++) p[i]=(uint8_t)(i & 0xff);   // write into the block
  uint32_t sum=0; for (uint32_t i=0;i<n;i++) sum+=p[i];  // read it back
  scr_wasm_free(p, n);
  return sum;
}
`;

describe.runIf(hasZig())("scr_wasm.c staging allocator (end-to-end)", () => {
  it("compiles for wasm32-wasi, exports alloc/free, and addresses writable memory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "scr-wasm-"));
    try {
      copyFileSync(RUNTIME_SRC, join(dir, "scr_wasm.c"));
      const { writeFileSync } = await import("node:fs");
      writeFileSync(join(dir, "driver.c"), DRIVER_C);
      execFileSync(
        "zig",
        [
          "cc", "-target", "wasm32-wasi", "-O2", "-mexec-model=reactor",
          "-Wl,--no-entry",
          ...wasmReactorLinkArgs(["roundtrip"]).slice(2), // reuse the --export flags
          "scr_wasm.c", "driver.c", "-o", "app.wasm",
        ],
        { cwd: dir },
      );
      const bytes = readFileSync(join(dir, "app.wasm"));
      const WA = (globalThis as unknown as { WebAssembly: any }).WebAssembly;
      const mod = new WA.Module(bytes);
      const exportNames = WA.Module.exports(mod).map((e: { name: string }) => e.name);
      expect(exportNames).toEqual(
        expect.arrayContaining(["memory", "scr_wasm_alloc", "scr_wasm_free", "roundtrip"]),
      );
      const inst = new WA.Instance(mod, {});
      const ex = inst.exports as Record<string, CallableFunction> & {
        _initialize?: () => void;
      };
      ex._initialize?.();
      expect((ex.roundtrip as (n: number) => number)(16)).toBe(120);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
