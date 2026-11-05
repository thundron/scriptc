import { readFileSync } from "node:fs";
import {
  parseRuntimePackManifest, selectRuntimePackArtifacts, validateRuntimePackIdentity,
} from "../../../packages/compiler/src/backend/runtime-pack-core.js";
import type { NativeLinkFeatures } from "../../../packages/compiler/src/backend/native-link-info.js";
import type { NativeTargetSpec } from "../../../packages/compiler/src/backend/targets.js";

const request = JSON.parse(readFileSync(process.argv[2]!, "utf8")) as {
  manifest: unknown;
  target: NativeTargetSpec;
  packageName: string;
  packageVersion: string;
  compilerVersion: string;
  features: NativeLinkFeatures;
  flavor: "release" | "dev";
};
try {
  const manifest = parseRuntimePackManifest(request.manifest);
  validateRuntimePackIdentity(manifest, request.packageName, request.packageVersion, request.target, request.compilerVersion);
  const selected = selectRuntimePackArtifacts(manifest, request.features, request.flavor, {});
  console.log(JSON.stringify({
    features: selected.features,
    runtime: selected.runtime.map((item) => ({ path: item.path, sha256: item.sha256, size: item.size })),
    archives: selected.archives.map((item) => ({ path: item.path, sha256: item.sha256, size: item.size })),
    systemLibraries: selected.systemLibraries,
  }));
} catch (error) {
  console.log(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
