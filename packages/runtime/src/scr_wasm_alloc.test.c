#include "scr_runtime.h"
#include <assert.h>
#include <stdio.h>

int main(void) {
#if defined(__wasm__) && UINTPTR_MAX == UINT32_MAX
#define CHECK_CLASS(N) do { void *p = scr_wsa_alloc_##N(); assert(p && (uintptr_t)p % 16 == 0); memset(p, 0xa5, N); scr_mem_free(p); } while (0)
  CHECK_CLASS(16); CHECK_CLASS(32); CHECK_CLASS(48); CHECK_CLASS(64);
  CHECK_CLASS(80); CHECK_CLASS(96); CHECK_CLASS(112); CHECK_CLASS(128);
  CHECK_CLASS(192); CHECK_CLASS(256); CHECK_CLASS(384); CHECK_CLASS(512);
#undef CHECK_CLASS
#endif
#if SCR_WASM_SMALL_ALLOC && defined(SCR_WSA_STATS) && SCR_WSA_STATS
  uint64_t old_count = scr_wsa_stats[2][0], old_bytes = scr_wsa_stats[2][1];
  void *noted = scr_wsa_alloc_48();
  assert(noted && scr_wsa_stats[2][0] == old_count + 1 && scr_wsa_stats[2][1] == old_bytes + 48);
  scr_mem_free(noted);
#endif
  enum { COUNT = 10000 };
  void **blocks = malloc(COUNT * sizeof *blocks);
  assert(blocks);
  for (size_t n = 0; n <= 600; n++) {
    unsigned char *p = scr_mem_calloc_ref(n);
    assert(p && (uintptr_t)p % 16 == 0);
#if SCR_WASM_SMALL_ALLOC
    assert((scr_wsa_owner(p) != NULL) == (n <= SCR_WSA_MAX));
    if (n <= SCR_WSA_MAX) assert(scr_mem_block_size(p) >= n);
#endif
    for (size_t i = 0; i < n; i++) assert(p[i] == 0);
    memset(p, 0xa5, n);
    unsigned char *grown = scr_mem_realloc_ref(p, n + 700);
    assert(grown);
    for (size_t i = 0; i < n; i++) assert(grown[i] == 0xa5);
    scr_mem_free(grown);
  }
  unsigned char *raw = scr_mem_calloc(37);
  assert(raw);
#if SCR_WASM_SMALL_ALLOC
  assert(scr_wsa_owner(raw));
#endif
  for (size_t i = 0; i < 37; i++) assert(raw[i] == 0);
  memset(raw, 0x43, 37);
  raw = scr_mem_realloc(raw, 70);
  assert(raw);
  for (size_t i = 0; i < 37; i++) assert(raw[i] == 0x43);
  scr_mem_free(raw);
  for (unsigned pass = 0; pass < 4; pass++) {
    for (size_t i = 0; i < COUNT; i++) {
      size_t n = i * 37 % 600 + 1;
      blocks[i] = scr_mem_calloc_ref(n);
      assert(blocks[i]);
      for (size_t j = 0; j < n; j++) assert(((unsigned char *)blocks[i])[j] == 0);
      memset(blocks[i], (unsigned char)i, n);
    }
    for (size_t i = 0; i < COUNT; i++) {
      size_t n = i * 37 % 600 + 1;
      for (size_t j = 0; j < n; j++) assert(((unsigned char *)blocks[i])[j] == (unsigned char)i);
    }
    /* Interleave empty, partial and full slabs instead of just LIFO frees. */
    for (size_t parity = 0; parity < 2; parity++) for (size_t i = parity; i < COUNT; i += 2) scr_mem_free(blocks[i]);
  }
  void *small = scr_mem_alloc_ref(32);
  assert(small);
  assert(scr_mem_realloc_ref(small, 8) == small);
  assert(scr_mem_realloc_ref(small, 0) == NULL);
  scr_mem_free(NULL);
  void *foreign = malloc(40);
  assert(foreign);
#if SCR_WASM_SMALL_ALLOC
  assert(scr_wsa_owner(foreign) == NULL);
#endif
  foreign = scr_mem_realloc(foreign, 1000);
  assert(foreign);
  scr_mem_free(foreign);
#if SCR_WASM_SMALL_ALLOC
  for (unsigned c = 0; c < SCR_WSA_CLASSES; c++) {
    assert(scr_wsa.empty[c]);
    assert(scr_wsa.partial[c] == scr_wsa.empty[c]);
    assert(scr_wsa.partial[c]->next == NULL);
  }
  /* Explicit collection must not discard a still-live slab. */
  small = scr_mem_calloc_ref(64);
  scr_wsa_trim();
  assert(scr_wsa_owner(small));
  scr_mem_free(small);
  scr_wsa_trim();
  for (size_t page = 0; page < 65536; page++) assert(scr_wsa.pages[page] == 0);
  for (unsigned c = 0; c < SCR_WSA_CLASSES; c++) {
    assert(scr_wsa.partial[c] == NULL && scr_wsa.empty[c] == NULL);
    void *again = scr_mem_calloc_ref(scr_wsa_size(c));
    assert(again && scr_wsa_owner(again));
    scr_mem_free(again);
  }
  scr_wsa_trim();
#endif
  free(blocks);
  puts("wasm allocator contracts passed");
  return 0;
}
