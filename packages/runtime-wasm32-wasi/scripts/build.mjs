import { ensureWasiSdk } from "./wasi-sdk.mjs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
process.env.SCRIPTC_RUNTIME_PACK_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
process.env.SCRIPTC_RUNTIME_PACK_CONFIG = JSON.stringify({
  platform: "wasi",
  // AbortSignal is portable here and dispatches through the EventTarget unit.
  extraRuntimeSources: ["scr_abort.c", "scr_event_target.c"],
  runtimeDefines: ["_GNU_SOURCE", "_WASI_EMULATED_SIGNAL", "_WASI_EMULATED_PROCESS_CLOCKS"],
  omitRuntimeSources: ["scr_child.c"],
  omitOptionalSources: [
    "scr_abort.c",
    "scr_event_target.c",
    "scr_loop_kqueue.c",
    "scr_loop_epoll.c",
    "scr_loop_wsapoll.c",
    "scr_net.c",
    "scr_http.c",
    "scr_http2.c",
    "scr_dgram.c",
    "scr_dns_promises.c",
    "scr_watch.c",
    "scr_tls_ca.c",
    "scr_tls.c",
    "scr_cipher.c",
    "scr_ecdh.c",
    "scr_dh.c",
    "scr_pki.c",
    "scr_webcrypto_pki.c",
    "scr_ed25519.c",
    "scr_tls_x509.c",
    "scr_webcrypto_aes.c",
    "scr_wasm.c",
    "scr_fetch.c",
  ],
  omitArchives: ["mbedtls"],
  compiler: "zig",
  compilerArgs: ["cc"],
  archiver: "zig",
  archiverArgs: ["ar"],
  target: {
    name: "wasm32-wasi",
    llvm_triple: "wasm32-unknown-wasi",
    architecture: "wasm32",
    object_format: "wasm",
    minimum_os: "WASI Preview 1",
  },
  targetArgs: ["-target", "wasm32-wasi"],
  compileFlags: ["-ffunction-sections", "-fdata-sections"],
  systemLibraries: [
    { name: "wasi-emulated-signal", predicate: true },
    { name: "wasi-emulated-process-clocks", predicate: true },
  ],
});
if (
  process.env.SCRIPTC_WASI_THREADS !== undefined &&
  !["0", "1"].includes(process.env.SCRIPTC_WASI_THREADS)
)
  throw new Error("SCRIPTC_WASI_THREADS must be 0 or 1");
const threads = process.env.SCRIPTC_WASI_THREADS !== "0";
if (threads) process.env.WASI_SDK_PATH = await ensureWasiSdk();
await import("../../runtime-pack-common/scripts/build.mjs");
if (threads) await import("./build-threads.mjs");
