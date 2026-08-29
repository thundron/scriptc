/** Native compiler facade. Recipe implementation lives with its semantic owner. */
export {
  EXECUTABLE_RUNTIME_SOURCES,
  runtimeSrcDir,
  runtimeFingerprint,
} from "./native/runtime-inputs.js";
export {
  executableSectionEliminationFlags,
  type CcDriver,
  isZigDriver,
  resolveCc,
  targetPlatform,
  cacheTargetIdentity,
} from "./native/driver.js";
export {
  executableNativeEnvironmentFingerprint,
  compilerDriverSupportsPersistentCache,
  ccVersion,
} from "./native/tool-identity.js";
export {
  type CcOptions,
  type ValidatedNativeArtifact,
  type LibArchiveOptions,
  type NativeArtifactDependency,
} from "./native/contracts.js";
export { CcCompileError, subprocessFailureDetail } from "./native/process.js";
export { compileLibArchive } from "./native/library.js";
export { localizeLibraryObjects } from "./native/object-merge.js";
export {
  implicitDependencyIncludeDirective,
  implicitDependencyProbeIncludes,
} from "./native/compiler-fingerprint.js";
export { parseLinkTraceFiles, nativeLinkerDependencyPaths } from "./native/linker-fingerprint.js";
export { clearCcCaches, stageRuntimeObjects } from "./native/runtime-objects.js";
export {
  snapshotNativeArtifactDependencies,
  nativeArtifactDependenciesStillMatch,
} from "./native/artifact-stamps.js";
export { compileC } from "./native/executable.js";
export {
  type NativeCacheWarmProfile,
  type WarmNativeCachesOptions,
  type WarmNativeCachesResult,
  supportedNativeCacheWarmProfiles,
  warmNativeCaches,
} from "./native/cache-warm.js";
export {
  toolchainEnvironmentCachePolicy,
  toolchainEnvironmentFingerprint,
  type ToolchainEnvironmentCachePolicy,
} from "./toolchain-environment.js";
export {
  IPHONEOS_MIN_VERSION,
  ANDROID_MIN_API,
  isIosTarget,
  isAndroidTarget,
  isMobileTarget,
  mobileLibraryTarget,
  mobileTargetRefusal,
  configuredTargetPlatform,
} from "./target-platform.js";
export {
  buildCacheRoot,
  prepareBuildCacheRoot,
  pruneBuildCache,
  resolveBuildCacheRoot,
  resolveCompilerStateRoot,
} from "./build-cache.js";
export { vendorCacheBuildIdentity, vendorCacheTargetFlavor } from "./native/vendor.js";

/* Nativetron browser reactors always link a small host-staging allocator. */
export const WASM_REACTOR_RUNTIME_SOURCES = ["scr_wasm_reactor.c"] as const;

export const WASM_REACTOR_SUPPORT_EXPORTS = ["scr_wasm_alloc", "scr_wasm_free"] as const;

export function wasmReactorLinkArgs(appExports: readonly string[]): string[] {
  const seen = new Set<string>();
  const exportsInOrder: string[] = [];
  for (const symbol of [...WASM_REACTOR_SUPPORT_EXPORTS, ...appExports]) {
    if (symbol.length === 0 || seen.has(symbol)) continue;
    seen.add(symbol);
    exportsInOrder.push(symbol);
  }
  return [
    "-mexec-model=reactor",
    "-Wl,--no-entry",
    ...exportsInOrder.map((symbol) => `-Wl,--export=${symbol}`),
  ];
}
