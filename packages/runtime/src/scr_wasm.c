/* Phase 3 (nativetron) — wasm reactor staging allocator.
 *
 * The browser host hands inbound strings/bytes to the guest by (1) calling the
 * exported scr_wasm_alloc(len) to reserve `len` bytes in the module's own
 * linear memory, (2) writing the bytes there, and (3) passing (ptr,len) into an
 * exported function. The guest copies the borrowed span in during the call
 * (the same borrowed-for-the-call rule as native FFI), after which the host may
 * scr_wasm_free it. These are thin malloc/free wrappers; the export_name
 * attributes make wasm-ld surface them as module exports in the reactor lane.
 *
 * Compiled ONLY into the wasm reactor artifact. On non-wasm targets the file is
 * inert (the attributes and bodies compile but are never referenced).
 */
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#if defined(__wasm__)
#define SCR_WASM_EXPORT(name) __attribute__((export_name(name)))
#else
#define SCR_WASM_EXPORT(name)
#endif

SCR_WASM_EXPORT("scr_wasm_alloc")
void *scr_wasm_alloc(uint32_t len) {
  /* malloc(0) may return NULL or a unique pointer; hand back a stable, freeable
   * one-byte block for empty spans so the host always gets a valid ptr. */
  return malloc(len == 0 ? 1 : (size_t)len);
}

SCR_WASM_EXPORT("scr_wasm_free")
void scr_wasm_free(void *ptr, uint32_t len) {
  (void)len; /* length is host bookkeeping; malloc tracks the real size */
  free(ptr);
}
