import { execFile } from "node:child_process";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const FEATURES = [
  "--enable-nontrapping-float-to-int",
  "--enable-bulk-memory",
  "--enable-sign-ext",
  "--enable-mutable-globals",
];

export async function optimizeWasmIfAvailable(wasmPath: string): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "scriptc-wasm-opt-"));
  const output = join(dir, "optimized.wasm");
  try {
    await execFileAsync("wasm-opt", ["-Oz", ...FEATURES, wasmPath, "-o", output]);
    await copyFile(output, wasmPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
