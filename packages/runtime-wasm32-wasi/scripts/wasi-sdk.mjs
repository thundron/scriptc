import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { withBuildLock } from "../../runtime-pack-common/scripts/build-state.mjs";

const exec = promisify(execFile);
export const WASI_SDK_VERSION = "31.0";
// Official wasi-sdk-31 release archive digests. Verify before running any SDK
// executable; scalar Zig libc's pthread_create is a stub, not an alternative.
export const WASI_SDK_ARCHIVES = {
  "darwin-arm64": {
    platform: "arm64-macos",
    sha256: "5fcc13ec7aae8e03e7988be82b5a6da9c05831db89dbc1b46cbe38153d3cc770",
  },
  "darwin-x64": {
    platform: "x86_64-macos",
    sha256: "b837bd84ffc58be4f909dd98eaf4c3b91a5740c09f675116cd62e9d5490db6a1",
  },
  "linux-arm64": {
    platform: "arm64-linux",
    sha256: "2a98882f3e69a1c9b87dae4f346d208137eba6682bf2a6aa6949e5c42b2c3267",
  },
  "linux-x64": {
    platform: "x86_64-linux",
    sha256: "e1cdf3f851ba090353c255627b1da997db57e0efc27631c5da55089c8bfb6a5d",
  },
  "win32-arm64": {
    platform: "arm64-windows",
    sha256: "7d040b9b4d605a9913740da6a2c197b5db19f78da01497061adc1600c4d27dc0",
  },
  "win32-x64": {
    platform: "x86_64-windows",
    sha256: "158863eda05d6614d7f9ad0c5c2ede27b1ea2ed5b1133596f47058bf831ac200",
  },
};

async function validSdk(path, pinned) {
  try {
    await access(join(path, "bin", process.platform === "win32" ? "clang.exe" : "clang"));
    await access(join(path, "share/wasi-sysroot/lib/wasm32-wasip1-threads/libc.a"));
    const version = (await readFile(join(path, "VERSION"), "utf8")).trim().split(/\r?\n/)[0];
    return !pinned || version === WASI_SDK_VERSION;
  } catch {
    return false;
  }
}

export async function downloadWasiSdkArchive(url, tarball, sha256, request = fetch) {
  const response = await request(url, { signal: AbortSignal.timeout(300000) });
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new Error("WASI SDK download failed (" + response.status + ")");
  }
  const hash = createHash("sha256");
  await pipeline(
    Readable.fromWeb(response.body),
    new Transform({
      transform(chunk, _encoding, callback) {
        hash.update(chunk);
        callback(null, chunk);
      },
    }),
    createWriteStream(tarball, { flags: "wx" }),
  );
  if (hash.digest("hex") !== sha256) throw new Error("WASI SDK archive digest mismatch");
}

export async function ensureWasiSdk() {
  if (process.env.WASI_SDK_PATH !== undefined) {
    if (process.env.WASI_SDK_PATH.trim() === "") throw new Error("WASI_SDK_PATH must not be empty");
    const path = resolve(process.env.WASI_SDK_PATH);
    if (!(await validSdk(path, false)))
      throw new Error(
        "WASI_SDK_PATH must name a WASI SDK with a real wasm32-wasip1-threads sysroot",
      );
    return path;
  }
  const archive = WASI_SDK_ARCHIVES[process.platform + "-" + process.arch];
  if (!archive)
    throw new Error("no pinned WASI SDK for this build host; set WASI_SDK_PATH explicitly");
  const cache = fileURLToPath(new URL("../../../node_modules/.cache", import.meta.url));
  await mkdir(cache, { recursive: true });
  const name = "wasi-sdk-" + WASI_SDK_VERSION + "-" + archive.platform,
    path = join(cache, name);
  return withBuildLock(join(cache, name + ".lock"), async () => {
    if (await validSdk(path, true)) return path;
    const stage = await mkdtemp(join(cache, name + "-staging-"));
    try {
      const tarball = join(stage, "sdk.tar.gz"),
        unpacked = join(stage, "sdk");
      const url =
        "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-31/" + name + ".tar.gz";
      console.log("downloading", name);
      await downloadWasiSdkArchive(url, tarball, archive.sha256);
      await mkdir(unpacked);
      await exec("tar", ["-xzf", tarball, "--strip-components=1", "-C", unpacked]);
      if (!(await validSdk(unpacked, true)))
        throw new Error("downloaded WASI SDK has an invalid threads sysroot or version");
      await writeFile(
        join(unpacked, ".scriptc-sdk-integrity.json"),
        JSON.stringify({ archive: name, sha256: archive.sha256 }) + "\n",
      );
      await rm(path, { recursive: true, force: true });
      await rename(unpacked, path);
      return path;
    } finally {
      await rm(stage, { recursive: true, force: true });
    }
  });
}
