/** Every host helper provides the same set of program object ABIs. */
export const nativeTargetCmakeArgs = [
  "-DSCRIPTC_TARGET_BACKENDS=AArch64;X86;WebAssembly",
  "-DSCRIPTC_ALLOWED_TARGETS=arm64-apple-macosx14.0.0,x86_64-apple-macosx14.0.0,x86_64-unknown-linux-gnu,aarch64-unknown-linux-gnu,x86_64-unknown-linux-musl,aarch64-unknown-linux-musl,x86_64-pc-windows-msvc,wasm32-unknown-wasi,arm64-apple-ios15.0.0,arm64-apple-ios15.0.0-simulator,aarch64-unknown-linux-android26",
];
