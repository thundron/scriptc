/* scr_alloc.c's small-block pool for wasm32's finite address space. Private runtimes
 * own whole, aligned 64 KiB slabs; a page tag distinguishes them from libc
 * blocks without reading before a foreign allocation. Threaded and audited
 * runtimes keep libc. No object or neutral storage crosses this pool's owner. */
#ifndef SCR_WASM_ALLOC_H
#define SCR_WASM_ALLOC_H

#ifndef SCR_WASM_SMALL_ALLOC
#if defined(__wasm__) && UINTPTR_MAX == UINT32_MAX && !defined(SCR_RC_AUDIT) && \
    !defined(SCR_WORKERS) && !(defined(SCR_LIB) && defined(SCR_THREAD_INSTANCES)) && \
    !defined(__SANITIZE_ADDRESS__)
#define SCR_WASM_SMALL_ALLOC 1
#else
#define SCR_WASM_SMALL_ALLOC 0
#endif
#endif

#if defined(__has_feature)
#if __has_feature(address_sanitizer)
#undef SCR_WASM_SMALL_ALLOC
#define SCR_WASM_SMALL_ALLOC 0
#endif
#endif
#if SCR_WASM_SMALL_ALLOC && (defined(SCR_WORKERS) || defined(SCR_RC_AUDIT) || (defined(SCR_LIB) && defined(SCR_THREAD_INSTANCES)))
#error "the wasm small-block pool requires a private, unaudited runtime"
#endif
#if SCR_WASM_SMALL_ALLOC
_Static_assert(sizeof(uintptr_t) == 4, "the slab page map requires wasm32 addresses");
#define SCR_WSA_PAGE ((size_t)65536)
#define SCR_WSA_CLASSES 12
#define SCR_WSA_MAX 512

typedef struct ScrWsaSlab {
  struct ScrWsaSlab *prev, *next;
  void *free;
  uint16_t live, virgin, capacity;
  uint8_t class_id;
} ScrWsaSlab;
#define SCR_WSA_HEADER ((sizeof(ScrWsaSlab) + 15) & ~(size_t)15)
typedef struct ScrWsaState {
  uint8_t pages[65536];
  ScrWsaSlab *partial[SCR_WSA_CLASSES];
  ScrWsaSlab *empty[SCR_WSA_CLASSES];
} ScrWsaState;
extern ScrWsaState scr_wsa;
#if defined(SCR_WSA_STATS) && SCR_WSA_STATS
/* Diagnostic builds only: pool take counts and requested bytes by class;
 * the last row counts libc-sized requests. No production hot-path cost. */
extern uint64_t scr_wsa_stats[SCR_WSA_CLASSES + 1][2];
#endif
ScrWsaSlab *scr_wsa_new_slab(unsigned c);
void scr_wsa_trim(void);

static inline unsigned scr_wsa_class(size_t n) {
  if (n <= 128) return (unsigned)(((n ? n : 1) + 15) / 16 - 1);
  return n <= 192 ? 8 : n <= 256 ? 9 : n <= 384 ? 10 : 11;
}
static inline size_t scr_wsa_size(unsigned c) {
  return c < 8 ? (c + 1) * 16 : c == 8 ? 192 : c == 9 ? 256 : c == 10 ? 384 : 512;
}
static inline ScrWsaSlab *scr_wsa_owner(const void *p) {
  if (!p || !scr_wsa.pages[(uintptr_t)p >> 16]) return NULL;
  return (ScrWsaSlab *)((uintptr_t)p & ~(uintptr_t)(SCR_WSA_PAGE - 1));
}
static inline void scr_wsa_unlink(ScrWsaSlab *s) {
  if (s->prev) s->prev->next = s->next;
  else scr_wsa.partial[s->class_id] = s->next;
  if (s->next) s->next->prev = s->prev;
  s->prev = s->next = NULL;
}
static inline void scr_wsa_link(ScrWsaSlab *s) {
  s->prev = NULL;
  s->next = scr_wsa.partial[s->class_id];
  if (s->next) s->next->prev = s;
  scr_wsa.partial[s->class_id] = s;
}
static inline __attribute__((always_inline)) void *scr_wsa_take(size_t n, bool zero) {
#if defined(SCR_WSA_STATS) && SCR_WSA_STATS
  unsigned stats_class = n > SCR_WSA_MAX ? SCR_WSA_CLASSES : scr_wsa_class(n);
  scr_wsa_stats[stats_class][0]++;
  scr_wsa_stats[stats_class][1] += n;
#endif
  if (n > SCR_WSA_MAX) return zero ? calloc(1, n) : malloc(n);
  unsigned c = scr_wsa_class(n);
  ScrWsaSlab *s = scr_wsa.partial[c];
  if (!s && !(s = scr_wsa_new_slab(c))) return zero ? calloc(1, n) : malloc(n);
  if (scr_wsa.empty[c] == s) scr_wsa.empty[c] = NULL;
  void *p;
  if (s->free) { p = s->free; s->free = *(void **)p; }
  else p = (char *)s + SCR_WSA_HEADER + scr_wsa_size(c) * s->virgin++;
  if (++s->live == s->capacity) scr_wsa_unlink(s);
  if (zero) memset(p, 0, n);
  return p;
}
static inline bool scr_wsa_free(void *p) {
  ScrWsaSlab *s = scr_wsa_owner(p);
  if (!s) return false;
  if (s->live == s->capacity) scr_wsa_link(s);
  *(void **)p = s->free;
  s->free = p;
  if (--s->live == 0) {
    unsigned c = s->class_id;
    if (!scr_wsa.empty[c]) scr_wsa.empty[c] = s;
    else {
      scr_wsa_unlink(s);
      scr_wsa.pages[(uintptr_t)s >> 16] = 0;
      free(s);
    }
  }
  return true;
}
#endif
#endif
