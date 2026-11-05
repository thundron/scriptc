export const IPHONEOS_MIN_VERSION = "15.0";
export const ANDROID_MIN_API = 26;

const MOBILE_LIBRARY_TARGETS = [
  "aarch64-apple-ios",
  "aarch64-apple-ios-simulator",
  "aarch64-linux-android",
] as const;

export function isIosTarget(target: string | null): boolean {
  return target === "aarch64-apple-ios" || target === "aarch64-apple-ios-simulator";
}

export function isAndroidTarget(target: string | null): boolean {
  return target === "aarch64-linux-android";
}

export function isMobileTarget(target: string | null): boolean {
  return isIosTarget(target) || isAndroidTarget(target);
}

/** The canonical mobile triple SCRIPTC_TARGET selects, or null when the
 * environment names none. Pure string inspection — safe to consult before
 * any toolchain discovery runs. */
export function mobileLibraryTarget(env: NodeJS.ProcessEnv = process.env): string | null {
  const target = env["SCRIPTC_TARGET"] ?? "";
  return isMobileTarget(target) ? target : null;
}

/** The admission verdict for a mobile-family triple: null when the spelling
 * and host pairing are supported, otherwise the refusal text (the same text
 * resolveCc throws and compileLibrary reports as SC3002). Pure string/host
 * inspection — no discovery, no subprocess. */
export function mobileTargetRefusal(
  target: string,
  hostPlatform: NodeJS.Platform = process.platform,
): string | null {
  if (isIosTarget(target)) {
    return hostPlatform === "darwin"
      ? null
      : `${target} library archives build on macOS hosts only (the Apple iOS SDK sysroot and Mach-O symbol localization live there); this host is ${hostPlatform}`;
  }
  if (isAndroidTarget(target)) return null;
  // A near-miss mobile spelling must refuse with the supported set named,
  // never reach zig with no sysroot wired (the compile would fail on the
  // first libc header) or produce an artifact for an unverified device
  // class.
  if (/(?:^|-)(?:ios|tvos|watchos|visionos|android)/.test(target)) {
    return `unsupported mobile target '${target}' (supported: ${MOBILE_LIBRARY_TARGETS.join(", ")})`;
  }
  return null;
}

export function configuredTargetPlatform(
  env: NodeJS.ProcessEnv = process.env,
  hostPlatform: NodeJS.Platform = process.platform,
): string {
  const target = env["SCRIPTC_TARGET"] ?? "";
  if (target === "") return hostPlatform;
  if (target === "wasm32-wasi") return "wasi";
  if (target.includes("wasi")) {
    throw new Error(`unsupported WASI target '${target}' (supported: wasm32-wasi)`);
  }
  // iOS is a darwin-family target: Mach-O objects, ld64 localization,
  // POSIX path/EOL semantics. Android falls to the linux arm below —
  // bionic is a linux libc and its archives are ordinary ELF.
  if (isIosTarget(target)) return "darwin";
  if (isAndroidTarget(target)) return "linux";
  if (/(?:^|-)(?:ios|tvos|watchos|visionos|android)/.test(target)) {
    throw new Error(
      `unsupported mobile target '${target}' (supported: ${MOBILE_LIBRARY_TARGETS.join(", ")})`,
    );
  }
  if (target.includes("linux")) return "linux";
  if (target.includes("windows")) return "win32";
  if (target.includes("macos") || target.includes("darwin")) return "darwin";
  throw new Error(
    `unsupported target '${target}' (supported OS families: linux, windows, macos/darwin, wasm32-wasi)`,
  );
}
