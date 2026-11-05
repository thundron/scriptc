#include <stdint.h>
#include <stdbool.h>

uint64_t sf_u64(uint64_t value) { return value; }
int64_t sf_i64(int64_t value) { return value; }
void *sf_pointer(void *value) { return value; }
uint8_t sf_byte(uint8_t value) { return value; }
uint8_t sf_first_byte(const uint8_t *value) { return *value; }
static uint8_t allocation;
void *sf_pointer_new(void) { return &allocation; }
uint8_t sf_pointer_check(void *value) { return value == &allocation; }
uint64_t sf_u64_callback(uint64_t (*cb)(uint64_t), uint64_t value) { return cb(value); }
int64_t sf_i64_callback(int64_t (*cb)(int64_t), int64_t value) { return cb(value); }
void *sf_pointer_callback(void *(*cb)(void *), void *value) { return cb(value); }
uint64_t sf_wide_mix(uint64_t a, double b, uint64_t c, float d, uint64_t e, double f,
                     uint64_t g, float h, uint64_t i, double j, uint64_t k, float l,
                     uint64_t m, double n) {
  return a + c + e + g + i + k + m + (uint64_t)(b + d + f + h + j + l + n);
}
static uint64_t (*saved)(uint64_t);
void sf_wide_start(uint64_t (*cb)(uint64_t)) { saved = cb; }
uint64_t sf_wide_fire(uint64_t value) { return saved(value); }
void sf_wide_stop(uint64_t (*cb)(uint64_t)) { if (saved == cb) saved = 0; }

uint64_t sf_invoke_pointer(void *callback, uint64_t value) {
  return ((uint64_t (*)(uint64_t))callback)(value);
}

#ifndef _WIN32
#include <pthread.h>
static void *sf_wrong_thread(void *callback) {
  ((void (*)(void))callback)();
  return NULL;
}
void sf_invoke_foreign(void *callback) {
  pthread_t thread;
  if (pthread_create(&thread, NULL, sf_wrong_thread, callback) == 0) pthread_join(thread, NULL);
}
#endif
