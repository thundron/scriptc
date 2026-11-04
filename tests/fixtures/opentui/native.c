#include <stdint.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

extern uint32_t createTextBuffer(uint8_t width_method);
extern void destroyTextBuffer(uint32_t handle);
extern void textBufferAppend(uint32_t handle, const uint8_t *data, uint32_t length);
extern uint32_t textBufferGetPlainText(uint32_t handle, uint8_t *out, uint32_t capacity);

uint32_t probe_create(void) { return createTextBuffer(0); }
/* OpenTUI append retains a non-owning pointer. Copies belong to this adapter
 * and remain alive until the corresponding text buffer is destroyed. */
struct chunk { uint32_t handle; struct chunk *next; uint8_t data[]; };
static struct chunk *chunks;
void probe_destroy(uint32_t handle) {
  destroyTextBuffer(handle);
  struct chunk **cursor = &chunks;
  while (*cursor) {
    struct chunk *entry = *cursor;
    if (entry->handle == handle) { *cursor = entry->next; free(entry); }
    else cursor = &entry->next;
  }
}
void probe_append(uint32_t handle, const uint8_t *data, size_t length) {
  if (length > UINT32_MAX) abort();
  if (length == 0) return;
  struct chunk *entry = malloc(sizeof(*entry) + length);
  if (!entry) abort();
  entry->handle = handle;
  entry->next = chunks;
  chunks = entry;
  memcpy(entry->data, data, length);
  textBufferAppend(handle, entry->data, (uint32_t)length);
}
uint32_t probe_read(uint32_t handle, uint8_t *out, size_t capacity) {
  if (capacity > UINT32_MAX) abort();
  return textBufferGetPlainText(handle, out, (uint32_t)capacity);
}

extern uint32_t createRenderer(uint32_t width, uint32_t height, uint8_t destination, uint8_t remote, void *feed);
extern void destroyRenderer(uint32_t handle, bool flush);
extern uint32_t getNextBuffer(uint32_t renderer);
extern void bufferClear(uint32_t buffer, const uint16_t *bg);
extern void bufferDrawText(uint32_t buffer, const uint8_t *text, uint32_t length, uint32_t x, uint32_t y, const uint16_t *fg, const uint16_t *bg, uint32_t attributes);
extern uint32_t bufferWriteResolvedChars(uint32_t buffer, uint8_t *out, uint32_t capacity, bool line_breaks);
extern uint8_t render(uint32_t renderer, bool force);

uint32_t probe_render(const uint8_t *text, size_t length, uint8_t *out, size_t capacity) {
  if (length > UINT32_MAX || capacity > UINT32_MAX) abort();
  uint32_t renderer = createRenderer(32, 2, 1, 2, NULL);
  if (!renderer) abort();
  uint32_t buffer = getNextBuffer(renderer);
  const uint16_t black[] = {0, 0, 0, 255};
  const uint16_t white[] = {255, 255, 255, 255};
  bufferClear(buffer, black);
  bufferDrawText(buffer, text, (uint32_t)length, 0, 0, white, NULL, 0);
  uint32_t written = bufferWriteResolvedChars(buffer, out, (uint32_t)capacity, true);
  uint8_t status = render(renderer, true);
  destroyRenderer(renderer, false);
  if (status != 0) abort();
  return written;
}
