#include <stdint.h>
#include <stddef.h>
#ifdef _WIN32
#include <process.h>
#include <windows.h>
#else
#include <pthread.h>
#endif

float sf_f32(float value) { return value; }
int8_t sf_i8(int8_t value) { return value; }
uint16_t sf_u16(uint16_t value) { return value; }
int16_t sf_i16(int16_t value) { return value; }

double sf_f32_callback(float (*callback)(float), float value) {
  return callback(value);
}
double sf_i8_callback(int8_t (*callback)(int8_t), int8_t value) {
  return callback(value);
}
double sf_u16_callback(uint16_t (*callback)(uint16_t), uint16_t value) {
  return callback(value);
}
double sf_i16_callback(int16_t (*callback)(int16_t), int16_t value) {
  return callback(value);
}

/* Mix register classes and spill arguments to the stack. The result is wide
 * enough to expose incorrect sign/zero extension of the narrow arguments. */
double sf_scalar_mix(int8_t a, uint16_t b, int16_t c, float d,
                     int8_t e, uint16_t f, int16_t g, float h,
                     int8_t i, uint16_t j, int16_t k, float l) {
  return (double)a + b + c + d + e + f + g + h + i + j + k + l;
}

void sf_fill(uint8_t *data, size_t len, uint8_t start) {
  for (size_t i = 0; i < len; i++) data[i] = (uint8_t)(start + i);
}

typedef void (*sf_widths_cb)(float, int8_t, uint16_t, int16_t, void *);
static sf_widths_cb widths_callback;
static void *widths_context;
#ifdef _WIN32
static HANDLE widths_thread;
static unsigned __stdcall sf_widths_worker(void *unused) {
#else
static pthread_t widths_thread;
static void *sf_widths_worker(void *unused) {
#endif
  (void)unused;
  widths_callback(0.1f, -128, 65535, -32768, widths_context);
  return 0;
}

void sf_widths_start(sf_widths_cb callback, void *context) {
  widths_callback = callback;
  widths_context = context;
#ifdef _WIN32
  widths_thread = (HANDLE)_beginthreadex(NULL, 0, sf_widths_worker, NULL, 0, NULL);
#else
  (void)pthread_create(&widths_thread, NULL, sf_widths_worker, NULL);
#endif
}

void sf_widths_stop(sf_widths_cb callback, void *context) {
  (void)callback;
  (void)context;
#ifdef _WIN32
  WaitForSingleObject(widths_thread, INFINITE);
  CloseHandle(widths_thread);
#else
  (void)pthread_join(widths_thread, NULL);
#endif
  widths_callback = NULL;
  widths_context = NULL;
}
