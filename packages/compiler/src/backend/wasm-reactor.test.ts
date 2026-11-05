import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wasmReactorLinkArgs, WASM_REACTOR_SUPPORT_EXPORTS } from "./native-toolchain.js";
import { wasmApi } from "./wasm-test-api.js";

describe("wasmReactorLinkArgs (unit)", () => {
  it("emits reactor exec-model + no-entry + one --export per symbol", () => {
    const args = wasmReactorLinkArgs(["onClick", "inited"]);
    expect(args[0]).toBe("-mexec-model=reactor");
    expect(args).toContain("-Wl,--no-entry");
    expect(args).toContain("-Wl,--export=scriptc_alloc");
    expect(args).toContain("-Wl,--export=scriptc_free");
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
      "-Wl,--export=scriptc_alloc",
      "-Wl,--export=scriptc_free",
      "-Wl,--export=memory",
      "-Wl,--export=onClick",
    ]);
  });

  it("support set is the two allocator exports (memory/_initialize are implicit)", () => {
    expect([...WASM_REACTOR_SUPPORT_EXPORTS]).toEqual(["scriptc_alloc", "scriptc_free"]);
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

const DRIVER_C = `#include <stdint.h>
#include <stdlib.h>
__attribute__((export_name("scriptc_alloc")))
void *scriptc_alloc(uint32_t n) { return malloc(n == 0 ? 1 : n); }
__attribute__((export_name("scriptc_free")))
void scriptc_free(void *p, uint32_t n) { (void)n; free(p); }
__attribute__((export_name("roundtrip")))
uint32_t roundtrip(uint32_t n){
  uint8_t *p = (uint8_t*)scriptc_alloc(n);
  for (uint32_t i=0;i<n;i++) p[i]=(uint8_t)(i & 0xff);   // write into the block
  uint32_t sum=0; for (uint32_t i=0;i<n;i++) sum+=p[i];  // read it back
  scriptc_free(p, n);
  return sum;
}
`;

describe.runIf(hasZig())("reactor staging exports (end-to-end)", () => {
  it("compiles for wasm32-wasi, exports alloc/free, and addresses writable memory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "scr-wasm-"));
    try {
      const { writeFileSync } = await import("node:fs");
      writeFileSync(join(dir, "driver.c"), DRIVER_C);
      execFileSync(
        "zig",
        [
          "cc",
          "-target",
          "wasm32-wasi",
          "-O2",
          "-mexec-model=reactor",
          "-Wl,--no-entry",
          ...wasmReactorLinkArgs(["roundtrip"]).slice(2), // reuse the --export flags
          "driver.c",
          "-o",
          "app.wasm",
        ],
        { cwd: dir },
      );
      const bytes = readFileSync(join(dir, "app.wasm"));
      const WA = wasmApi;
      const mod = new WA.Module(bytes);
      const exportNames = WA.Module.exports(mod).map((e: { name: string }) => e.name);
      expect(exportNames).toEqual(
        expect.arrayContaining(["memory", "scriptc_alloc", "scriptc_free", "roundtrip"]),
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
