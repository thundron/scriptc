import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pinnedNode = readFileSync(join(root, ".node-version"), "utf8").trim();
const icuInputs = readFileSync(
  join(root, "packages/runtime-pack-common/scripts/icu-inputs.mjs"),
  "utf8",
);
const expectedIcu = /export const ICU_VERSION = "([^"]+)"/.exec(icuInputs)?.[1];

if (process.versions.node !== pinnedNode || process.versions.icu !== expectedIcu) {
  throw new Error(
    `test oracle mismatch: running Node ${process.versions.node} with ICU ${process.versions.icu}; ` +
      `expected the official Node ${pinnedNode} distribution with ICU ${expectedIcu}. ` +
      `Install https://nodejs.org/dist/v${pinnedNode}/node-v${pinnedNode}-${process.platform}-${process.arch}.tar.gz`,
  );
}

function hostRuntimePackage() {
  if (process.platform === "darwin" && (process.arch === "arm64" || process.arch === "x64"))
    return `runtime-darwin-${process.arch}`;
  if (process.platform === "win32" && process.arch === "x64") return "runtime-win32-x64-msvc";
  if (process.platform === "linux" && (process.arch === "arm64" || process.arch === "x64")) {
    const glibc = process.report.getReport().header.glibcVersionRuntime;
    return `runtime-linux-${process.arch}-${glibc ? "gnu" : "musl"}`;
  }
  return null;
}

const runtimePackage = hostRuntimePackage();
if (runtimePackage !== null) {
  const packageRoot = join(root, "packages", runtimePackage);
  const packageManifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  const manifestPath = join(packageRoot, "runtime-pack.json");
  if (!existsSync(manifestPath)) {
    throw new Error(
      `${packageManifest.name}: runtime-pack.json is missing; run ` +
        `node packages/${runtimePackage}/scripts/build.mjs`,
    );
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const abiSource = readFileSync(
    join(root, "packages/compiler/src/backend/runtime-abi.ts"),
    "utf8",
  );
  const abiVersion = Number(/RUNTIME_ABI_VERSION = (\d+)/.exec(abiSource)?.[1]);
  const abiMarker = /RUNTIME_ABI_MARKER = "([^"]+)"/.exec(abiSource)?.[1];
  if (
    manifest.schema !== "scriptc.runtime-pack.v1" ||
    manifest.format !== 1 ||
    manifest.package !== packageManifest.name ||
    manifest.version !== packageManifest.version ||
    manifest.runtime_abi?.version !== abiVersion ||
    manifest.runtime_abi?.marker !== abiMarker
  ) {
    throw new Error(
      `${packageManifest.name}: runtime pack is stale or incompatible; run ` +
        `node packages/${runtimePackage}/scripts/build.mjs`,
    );
  }
}
