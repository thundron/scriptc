/* wasm reactor staging allocator (scr_wasm_alloc/free). */
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
  return malloc(len == 0 ? 1 : (size_t)len);
}

SCR_WASM_EXPORT("scr_wasm_free")
void scr_wasm_free(void *ptr, uint32_t len) {
  (void)len;
  free(ptr);
}
