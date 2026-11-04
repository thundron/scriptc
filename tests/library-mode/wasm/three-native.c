#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

extern void app_init(void);
extern void app_collect(void);
extern double app_frame(double time, double aspect);
extern double app_dispose(void);
extern int32_t app_callback(const char *name, void (*fn)(void), void *context);
extern void app_sink(void (*fn)(void *, const uint8_t *, size_t, uint64_t), void *context);

static double rounded(double value) { return fabs(value) < 0.0000000005 ? 0 : value; }
static void vertex(void *context, uint32_t index, double x, double y, double z) {
  (void)context;
  printf("[\"vertex\",%u,%.9f,%.9f,%.9f]\n", index, rounded(x), rounded(y), rounded(z));
}
static void surface(void *context, double red, double green, double blue, double roughness, double metalness) {
  (void)context;
  printf("[\"surface\",%.9f,%.9f,%.9f,%.9f,%.9f]\n", red, green, blue, roughness, metalness);
}
static void resource(void *context, uint32_t index, double version, double size) {
  (void)context;
  printf("[\"resource\",%u,%.0f,%.0f]\n", index, version, size);
}
static void panic(void *context, const uint8_t *message, size_t length, uint64_t address) {
  (void)context; (void)address;
  fwrite(message, 1, length, stderr);
  exit(1);
}
int main(void) {
  app_sink(panic, NULL);
  if (app_callback("vertex", (void (*)(void))vertex, NULL) ||
      app_callback("surface", (void (*)(void))surface, NULL) ||
      app_callback("resource", (void (*)(void))resource, NULL)) return 2;
  for (int session = 0; session < 2; session++) {
    app_init();
    const double times[] = { 0, 123, 2000 };
    for (size_t i = 0; i < 3; i++) if (app_frame(times[i], 1.5) != 24) return 3;
    app_dispose();
    app_collect();
  }
  return 0;
}
