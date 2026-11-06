#!/usr/bin/env node
/* Add real WASI-pthreads library flavors to the baseline pack. The SDK is a
 * build tool, not a runtime dependency. All needed libc/CRT/builtins artifacts
 * and their notices are staged into the pack; consumers still link with Zig. */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { ensureWasiSdk, WASI_SDK_VERSION } from "./wasi-sdk.mjs";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { parallelMap } from "../../runtime-pack-common/scripts/parallel-map.mjs";
import {
  withBuildLock,
  installRuntimePack,
} from "../../runtime-pack-common/scripts/build-state.mjs";
import { createDeterministicArchive } from "../../runtime-pack-common/scripts/archive.mjs";

const exec = promisify(execFile);
const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repo = fileURLToPath(new URL("../../..", import.meta.url));
const sdk = await ensureWasiSdk();
const sdkVersion = (await readFile(join(sdk, "VERSION"), "utf8")).trim();
if (sdkVersion.split(/\r?\n/)[0] !== WASI_SDK_VERSION && !process.env.WASI_THREADS_LICENSE_FILE)
  throw new Error(
    "a non-pinned WASI SDK requires WASI_THREADS_LICENSE_FILE with its redistribution notices",
  );
const notices =
  process.env.WASI_THREADS_LICENSE_FILE ?? join(packageRoot, "licenses/WASI_THREADS.txt");
const compiler =
  process.env.SCRIPTC_WASI_THREAD_CC ??
  join(sdk, "bin", process.platform === "win32" ? "clang.exe" : "clang");
const env = {
  ...process.env,
  ...(process.platform === "darwin"
    ? {
        DYLD_LIBRARY_PATH:
          join(sdk, "lib") +
          (process.env.DYLD_LIBRARY_PATH ? ":" + process.env.DYLD_LIBRARY_PATH : ""),
      }
    : {}),
};
const compilerIdentity = (await exec(compiler, ["--version"], { env })).stdout.split("\n")[0];
const lib = join(sdk, "share/wasi-sysroot/lib/wasm32-wasip1-threads");
const resource = (await readdir(join(sdk, "lib/clang")))
  .filter((x) => /^\d+$/.test(x))
  .sort((a, b) => Number(b) - Number(a))[0];
if (!resource) throw new Error("WASI SDK has no clang resource directory");
const builtins = join(
  sdk,
  `lib/clang/${resource}/lib/wasm32-unknown-wasip1-threads/libclang_rt.builtins.a`,
);
for (const file of [join(lib, "libc.a"), join(lib, "crt1-reactor.o"), builtins, notices])
  await stat(file);

await withBuildLock(join(packageRoot, ".runtime-pack-build.lock"), async () => {
  const parent = join(repo, "node_modules/.cache");
  await mkdir(parent, { recursive: true });
  const stage = await mkdtemp(join(parent, "wasi-thread-pack-"));
  const outputRoot = join(packageRoot, "artifacts"),
    manifestPath = join(packageRoot, "runtime-pack.json");
  const stagedOutputRoot = join(stage, "artifacts"),
    stagedManifestPath = join(stage, "runtime-pack.json");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    if (manifest.target.object_format !== "wasm")
      throw new Error("thread extension requires the wasm runtime pack");
    await cp(outputRoot, stagedOutputRoot, { recursive: true });
    const artifact = async (path) => ({
      path,
      sha256: createHash("sha256")
        .update(await readFile(join(stage, path)))
        .digest("hex"),
      size: (await stat(join(stage, path))).size,
    });
    const include = [
      "quickjs-ng",
      "zlib",
      "brotli/c/include",
      "zstd/lib",
      "mbedtls/include",
    ].flatMap((p) => ["-I", join(repo, "packages/runtime/vendor", p)]);
    const root = join(repo, "packages/runtime/src");
    const flags = [
      "--target=wasm32-wasip1-threads",
      "--sysroot=" + join(sdk, "share/wasi-sysroot"),
      "-resource-dir",
      join(sdk, "lib/clang", resource),
      "-std=c11",
      "-pthread",
      "-matomics",
      "-mbulk-memory",
      "-fno-math-errno",
      "-fno-strict-aliasing",
      "-ffunction-sections",
      "-fdata-sections",
      "-Wno-deprecated-declarations",
      "-D_GNU_SOURCE",
      "-D_WASI_EMULATED_SIGNAL",
      "-D_WASI_EMULATED_PROCESS_CLOCKS",
      "-D_WASI_EMULATED_GETPID",
      "-g0",
      "-I",
      root,
      ...include,
      `-ffile-prefix-map=${repo}=.`,
      `-ffile-prefix-map=${sdk}=wasi-sdk`,
    ];
    for (const optimization of ["release", "dev"]) {
      const original = manifest.flavors["library-" + optimization];
      if (!original) throw new Error("build baseline library flavors first");
      const name = "library-thread-" + optimization;
      const units = await parallelMap(original.runtime_units, 4, async (unit) => {
        const variants = [];
        for (const input of unit.variants) {
          const defines = [...new Set([...input.defines, "SCR_LIB", "SCR_THREAD_INSTANCES"])];
          const path = `artifacts/${name}/runtime/${input.id}/${unit.source.replace(/\.c$/, ".o")}`;
          const output = join(stage, path);
          await mkdir(dirname(output), { recursive: true });
          await exec(
            compiler,
            [
              ...flags,
              original.optimization,
              ...defines.map((x) => "-D" + x),
              "-c",
              join(root, unit.source),
              "-o",
              output,
            ],
            { env, maxBuffer: 8 * 1024 * 1024 },
          );
          variants.push({ ...input, defines, ...(await artifact(path)) });
        }
        return { ...unit, variants };
      });
      manifest.flavors[name] = { optimization: original.optimization, runtime_units: units };
      console.log("built", name);
    }
    // Real pthread libc is carried by the threaded selection only. In
    // particular, never let the scalar toolchain's pthread_create stub win.
    const ids = [
      "libc.a",
      "libm.a",
      "libwasi-emulated-signal.a",
      "libwasi-emulated-process-clocks.a",
      "libwasi-emulated-getpid.a",
    ];
    manifest.archives = manifest.archives.filter((a) => !a.id.startsWith("wasi-threads-"));
    for (const file of ids) {
      const id = "wasi-threads-" + file.replace(/\.a$/, "");
      const path = `artifacts/vendor/wasi-threads/${file}`;
      await mkdir(dirname(join(stage, path)), { recursive: true });
      await copyFile(join(lib, file), join(stage, path));
      manifest.archives.push({ id, predicate: "wasmThreads", ...(await artifact(path)) });
    }
    const path = "artifacts/vendor/wasi-threads/libclang_rt.builtins.a";
    await copyFile(builtins, join(stage, path));
    manifest.archives.push({
      id: "wasi-threads-builtins",
      predicate: "wasmThreads",
      ...(await artifact(path)),
    });
    const crtPath = "artifacts/vendor/wasi-threads/crt.a";
    await createDeterministicArchive(
      "zig",
      join(stage, crtPath),
      [join(lib, "crt1-reactor.o")],
      ["ar"],
    );
    manifest.archives.push({
      id: "wasi-threads-crt",
      predicate: "wasmThreads",
      ...(await artifact(crtPath)),
    });
    manifest.system_libraries = manifest.system_libraries.map((library) => {
      if (library.predicate === false) return library;
      const predicate =
        typeof library.predicate === "string"
          ? { all: [library.predicate] }
          : library.predicate === true
            ? {}
            : library.predicate;
      return {
        ...library,
        predicate: { ...predicate, not: [...new Set([...(predicate.not ?? []), "wasmThreads"])] },
      };
    });
    const licensePath = "artifacts/licenses/wasi-threads.txt";
    await copyFile(notices, join(stage, licensePath));
    manifest.licenses = manifest.licenses.filter((l) => l.path !== licensePath);
    manifest.licenses.push({
      path: licensePath,
      license:
        "Apache-2.0 WITH LLVM-exception AND Apache-2.0 AND MIT AND BSD-2-Clause AND BSD-3-Clause AND CC0-1.0",
    });
    manifest.compiler.threaded = {
      identity: compilerIdentity,
      sdk: sdkVersion,
    };
    manifest.macros.executable = manifest.macros.executable.filter(
      (macro) => macro !== "SCR_LIB" && macro !== "SCR_THREAD_INSTANCES",
    );
    await writeFile(stagedManifestPath, JSON.stringify(manifest, null, 2) + "\n");
    const suffix = process.pid + "-" + Date.now();
    await installRuntimePack({
      outputRoot,
      manifestPath,
      stagedOutputRoot,
      stagedManifestPath,
      backupRoot: join(packageRoot, ".thread-artifacts-backup-" + suffix),
      backupManifestPath: join(packageRoot, ".thread-manifest-backup-" + suffix),
    });
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
});
