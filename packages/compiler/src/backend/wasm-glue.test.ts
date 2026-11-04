import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { emitWasmGlue, type WasmGlueModule } from "./wasm-glue.js";

const DEMO: WasmGlueModule = {
  stem: "app",
  imports: [{ module: "nt", name: "dom_set_text", params: ["string"], result: "void" }],
  exports: [
    { name: "onClick", params: ["string"], result: "void" },
    { name: "inited", params: [], result: "i32" },
  ],
};

describe("emitWasmGlue (unit)", () => {
  const glue = emitWasmGlue(DEMO);

  it("expands string import params into (ptr,len) and decodes them", () => {
    expect(glue).toContain(
      `"dom_set_text": (p0, l0) => { host["dom_set_text"](readStr(p0, l0)); }`,
    );
  });

  it("stages string export args through scriptc_alloc and passes (ptr,len)", () => {
    expect(glue).toContain(`"onClick": (a0) => {`);
    expect(glue).toContain(`const [p0, l0] = passStr(a0);`);
    expect(glue).toContain(`exports["onClick"](p0, l0);`);
  });

  it("passes scalar exports through and returns the result", () => {
    expect(glue).toContain(`"inited": () => {`);
    expect(glue).toContain(`return exports["inited"]();`);
  });

  it("groups imports by module namespace and runs _initialize", () => {
    expect(glue).toContain(`"nt": {`);
    expect(glue).toContain(`exports._initialize && exports._initialize();`);
    expect(glue).toContain("export async function instantiateFromBytes");
  });

  it("refuses string/bytes results (unsupported in the wasm host-import ABI)", () => {
    expect(() =>
      emitWasmGlue({
        stem: "x",
        imports: [],
        exports: [{ name: "f", params: [], result: "string" }],
      }),
    ).toThrow(/string\/bytes results are not supported/);
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

const REACTOR_C = `#include <stdint.h>
__attribute__((import_module("nt"), import_name("dom_set_text")))
extern void host_dom_set_text(const uint8_t *ptr, uint32_t len);
static uint8_t heap[4096]; static uint32_t hp;
__attribute__((export_name("scriptc_alloc")))
uint8_t *scriptc_alloc(uint32_t n){ uint8_t *p=heap+hp; hp+=n; return p; }
static int g_inited;
__attribute__((constructor)) static void nt_init(void){ g_inited = 42; }
__attribute__((export_name("onClick")))
void onClick(const uint8_t *ptr, uint32_t len){ host_dom_set_text(ptr, len); }
__attribute__((export_name("inited")))
int inited(void){ return g_inited; }
`;

describe.runIf(hasZig())("emitWasmGlue (end-to-end against a real reactor)", () => {
  it("drives host imports and guest exports over linear memory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "wasm-glue-"));
    try {
      writeFileSync(join(dir, "reactor.c"), REACTOR_C);
      execFileSync(
        "zig",
        [
          "cc",
          "-target",
          "wasm32-wasi",
          "-O2",
          "-mexec-model=reactor",
          "-Wl,--no-entry",
          "reactor.c",
          "-o",
          "app.wasm",
        ],
        { cwd: dir },
      );
      writeFileSync(join(dir, "app.glue.mjs"), emitWasmGlue(DEMO));
      const mod = await import(pathToFileURL(join(dir, "app.glue.mjs")).href);

      let received: string | null = null;
      const api = await mod.instantiateFromBytes(readFileSync(join(dir, "app.wasm")), {
        dom_set_text: (s: string) => {
          received = s;
        },
      });

      expect(api.inited()).toBe(42); // constructor ran via _initialize
      api.onClick("Hello from compiled reactor");
      expect(received).toBe("Hello from compiled reactor"); // export -> import round-trip
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
