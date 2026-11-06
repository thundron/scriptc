import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import {
  downloadWasiSdkArchive,
  ensureWasiSdk,
  WASI_SDK_ARCHIVES,
} from "../../packages/runtime-wasm32-wasi/scripts/wasi-sdk.mjs";

afterEach(() => vi.unstubAllEnvs());
test("SDK downloads verify pinned digests and never overwrite an existing archive", async () => {
  const dir = await mkdtemp(join(tmpdir(), "scriptc-sdk-download-"));
  try {
    const bytes = new Uint8Array([1, 2, 3]),
      hash = createHash("sha256").update(bytes).digest("hex");
    const request = async () => new Response(bytes);
    const path = join(dir, "sdk.tgz");
    await downloadWasiSdkArchive("https://example.invalid/sdk.tgz", path, hash, request);
    expect(new Uint8Array(await readFile(path))).toEqual(bytes);
    await expect(
      downloadWasiSdkArchive("https://example.invalid/sdk.tgz", path, hash, request),
    ).rejects.toThrow();
    expect(new Uint8Array(await readFile(path))).toEqual(bytes);
    await expect(
      downloadWasiSdkArchive(
        "https://example.invalid/sdk.tgz",
        join(dir, "bad.tgz"),
        "0".repeat(64),
        request,
      ),
    ).rejects.toThrow("digest mismatch");
    await expect(
      downloadWasiSdkArchive(
        "https://example.invalid/sdk.tgz",
        join(dir, "missing.tgz"),
        hash,
        async () => new Response("missing", { status: 404 }),
      ),
    ).rejects.toThrow("404");
    for (const archive of Object.values(WASI_SDK_ARCHIVES) as {
      platform: string;
      sha256: string;
    }[]) {
      expect(archive.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(archive.platform).toMatch(/^(arm64|x86_64)-(macos|linux|windows)$/);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("explicit SDK paths are authoritative and require the threads sysroot", async () => {
  const dir = await mkdtemp(join(tmpdir(), "scriptc-sdk-path-"));
  try {
    vi.stubEnv("WASI_SDK_PATH", dir);
    await expect(ensureWasiSdk()).rejects.toThrow("real wasm32-wasip1-threads");
    await mkdir(join(dir, "bin"));
    await mkdir(join(dir, "share/wasi-sysroot/lib/wasm32-wasip1-threads"), { recursive: true });
    await writeFile(join(dir, "bin", process.platform === "win32" ? "clang.exe" : "clang"), "");
    await writeFile(join(dir, "share/wasi-sysroot/lib/wasm32-wasip1-threads/libc.a"), "");
    await writeFile(join(dir, "VERSION"), "31.0\n");
    expect(await ensureWasiSdk()).toBe(dir);
    vi.stubEnv("WASI_SDK_PATH", "");
    await expect(ensureWasiSdk()).rejects.toThrow("must not be empty");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
