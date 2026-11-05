import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { loadNativeToolchain } from "../../../packages/compiler/src/native/toolchain.js";
import { stageNativeRuntimePack } from "../../../packages/compiler/src/backend/runtime-pack-native.js";
import { validateNativeCodegenVersion } from "../../../packages/compiler/src/backend/native-codegen-core.js";
import type { NativeLinkFeatures } from "../../../packages/compiler/src/backend/native-link-info.js";

const request = JSON.parse(readFileSync(process.argv[2]!, "utf8")) as {
  toolchain: string;
  stage: string;
  features: NativeLinkFeatures;
  action: "stage" | "helper";
  version: Record<string, unknown>;
};
try {
  const toolchain = loadNativeToolchain(request.toolchain);
  if (request.action === "helper") {
    const version = validateNativeCodegenVersion(request.version, toolchain.target, toolchain.helper, toolchain.compilerVersion);
    console.log(version.protocol_version, version.scriptc_package_version, version.llvm_version, version.default_target);
  } else {
    const pack = stageNativeRuntimePack(toolchain.runtimePackRoot, request.stage, toolchain.target,
      toolchain.compilerVersion, request.features, "release");
    console.log(JSON.stringify({
      runtime: pack.runtimeObjects.map((path) => relative(request.stage, path)),
      archives: pack.archives.map((path) => relative(request.stage, path)),
      libraries: pack.systemLibraries,
    }));
  }
} catch (error) {
  console.log(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
