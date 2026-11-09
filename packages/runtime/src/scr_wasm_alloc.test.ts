import { execFile, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { WASI } from "node:wasi";
import { expect, test } from "vitest";
const exec = promisify(execFile);
const zig = spawnSync("zig", ["version"]).status === 0;
test.skipIf(!zig).each([
  [true, false],
  [false, false],
  [true, true],
])("wasm reference pool contracts (pool=%s, stats=%s)", async (enabled, stats) => {
  const dir = await mkdtemp(join(tmpdir(), "scriptc-wasm-alloc-"));
  try {
    const file = join(dir, "test.wasm");
    await exec("zig", [
      "cc",
      "-target",
      "wasm32-wasi",
      "-std=c11",
      "-O2",
      "-ffunction-sections",
      "-fdata-sections",
      ...(enabled ? [] : ["-DSCR_WASM_SMALL_ALLOC=0"]),
      ...(stats ? ["-DSCR_WSA_STATS=1"] : []),
      join(import.meta.dirname, "scr_wasm_alloc.test.c"),
      join(import.meta.dirname, "scr_alloc.c"),
      "-o",
      file,
    ]);
    const wasi = new WASI({ version: "preview1", args: [file], env: {}, returnOnExit: true });
    const module = await WebAssembly.compile(await readFile(file));
    const instance = await WebAssembly.instantiate(module, wasi.getImportObject());
    expect(wasi.start(instance)).toBe(0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test.skipIf(!zig).each([
  ["threaded library", ["-DSCR_LIB", "-DSCR_THREAD_INSTANCES"]],
  ["audited", ["-DSCR_RC_AUDIT"]],
])("wasm pool stays disabled for %s runtimes", async (_name, flags) => {
  const { stdout } = await exec("zig", [
    "cc",
    "-target",
    "wasm32-wasi",
    "-E",
    "-dM",
    ...flags,
    join(import.meta.dirname, "scr_wasm_alloc.test.c"),
  ]);
  expect(stdout).toMatch(/^#define SCR_WASM_SMALL_ALLOC 0$/m);
});
