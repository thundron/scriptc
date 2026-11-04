#include "scr_runtime.h"
#include <assert.h>
#include <errno.h>
#include <setjmp.h>
#include <stdio.h>

static jmp_buf panic;
static int calls;
static int mode;
static unsigned char next_byte;

ssize_t getrandom(void *buf, size_t n, unsigned int flags) {
  assert(flags == 0);
  calls++;
  if (mode == 1) return 0;
  if (mode == 2) { errno = EIO; return -1; }
  if (calls == 1) { errno = EINTR; return -1; }
  size_t count = n < 3 ? n : 3;
  unsigned char *bytes = buf;
  for (size_t i = 0; i < count; i++) bytes[i] = next_byte++;
  return (ssize_t)count;
}

_Noreturn void scr_trap(const char *message) {
  assert(strcmp(message, "scriptc: getrandom failed\n") == 0);
  longjmp(panic, 1);
}

int main(void) {
  unsigned char bytes[17];
  memset(bytes, 255, sizeof bytes);
  arc4random_buf(bytes, 0);
  assert(calls == 0);
  arc4random_buf(bytes, sizeof bytes);
  assert(calls == 7);
  for (size_t i = 0; i < sizeof bytes; i++) assert(bytes[i] == i);
  for (mode = 1; mode <= 2; mode++) {
    if (setjmp(panic) == 0) {
      arc4random_buf(bytes, sizeof bytes);
      assert(0 && "entropy failure must trap");
    }
  }
  puts("entropy retries and failures verified");
  return 0;
}
