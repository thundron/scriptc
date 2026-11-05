/* Isolated JavaScript evaluation for comptime callbacks. No filesystem,
 * process, module loader, or console bindings enter the guest context. */
#ifndef _WIN32
#define _POSIX_C_SOURCE 200809L
#endif
#include "quickjs.h"
#include <errno.h>
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#ifdef _WIN32
#include <windows.h>
#else
#include <time.h>
#endif

static uint64_t now_ms(void) {
#ifdef _WIN32
  return GetTickCount64();
#else
  struct timespec ts;
  if (clock_gettime(CLOCK_MONOTONIC, &ts) != 0) return 0;
  return (uint64_t)ts.tv_sec * 1000 + (uint64_t)ts.tv_nsec / 1000000;
#endif
}

typedef struct { uint64_t deadline; int interrupted; } Budget;
static int interrupt(JSRuntime *rt, void *opaque) {
  (void)rt;
  Budget *budget = opaque;
  if (now_ms() >= budget->deadline) budget->interrupted = 1;
  return budget->interrupted;
}

typedef struct {
  char *data;
  size_t length, capacity;
  void *active[512];
  size_t depth;
} Output;

static int append(Output *out, const char *text) {
  size_t size = strlen(text);
  if (size > 64 * 1024 * 1024 - out->length) return -1;
  size_t required = out->length + size + 1;
  if (required > out->capacity) {
    size_t capacity = out->capacity ? out->capacity : 1024;
    while (capacity < required) capacity *= 2;
    char *data = realloc(out->data, capacity);
    if (!data) return -1;
    out->data = data;
    out->capacity = capacity;
  }
  memcpy(out->data + out->length, text, size + 1);
  out->length += size;
  return 0;
}

static int quote(JSContext *ctx, Output *out, JSValueConst value) {
  size_t length;
  const uint16_t *text = JS_ToCStringLenUTF16(ctx, &length, value);
  if (!text) return -1;
  int status = append(out, "\"");
  for (size_t i = 0; status == 0 && i < length; i++) {
    char escaped[7];
    unsigned ch = text[i];
    if (ch >= 32 && ch < 127 && ch != '"' && ch != '\\') {
      escaped[0] = (char)ch; escaped[1] = 0;
    } else snprintf(escaped, sizeof(escaped), "\\u%04x", ch);
    status = append(out, escaped);
  }
  JS_FreeCStringUTF16(ctx, text);
  return status == 0 ? append(out, "\"") : status;
}

/* Serialize through engine APIs, outside the callback's mutable globals.
 * The guest cannot replace JSON.stringify or install a toJSON hook that
 * changes the value the compiler validates. */
static int encode(JSContext *ctx, Output *out, JSValueConst value) {
  if (JS_IsException(value)) return -1;
  if (JS_IsUndefined(value)) return append(out, "[\"undefined\"]");
  if (JS_IsNull(value)) return append(out, "[\"null\"]");
  if (JS_IsBool(value)) return append(out, JS_ToBool(ctx, value) ? "[\"boolean\",true]" : "[\"boolean\",false]");
  if (JS_IsFunction(ctx, value)) return append(out, "[\"function\"]");
  if (JS_IsSymbol(value)) return append(out, "[\"symbol\"]");
  if (JS_IsString(value) || JS_IsNumber(value) || JS_IsBigInt(value)) {
    const char *tag = JS_IsString(value) ? "[\"string\"," : JS_IsNumber(value) ? "[\"number\"," : "[\"bigint\",";
    if (append(out, tag) != 0) return -1;
    double number = 1;
    if (JS_IsNumber(value) && JS_ToFloat64(ctx, &number, value) < 0) return -1;
    int status = number == 0 && signbit(number) ? append(out, "\"-0\"") : quote(ctx, out, value);
    return status == 0 ? append(out, "]") : status;
  }
  if (out->depth == 512) { JS_ThrowTypeError(ctx, "compile-time result is nested too deeply"); return -1; }
  void *identity = JS_VALUE_GET_PTR(value);
  for (size_t i = 0; i < out->depth; i++) {
    if (out->active[i] == identity) { JS_ThrowTypeError(ctx, "cyclic compile-time result"); return -1; }
  }
  out->active[out->depth++] = identity;
  int status = 0;
  if (JS_IsArray(value)) {
    int64_t length = 0;
    if (JS_GetLength(ctx, value, &length) < 0 || length < 0 || length > 1000000) status = -1;
    if (status == 0) status = append(out, "[\"array\",[");
    for (int64_t i = 0; status == 0 && i < length; i++) {
      if (i != 0) status = append(out, ",");
      JSValue item = JS_GetPropertyUint32(ctx, value, (uint32_t)i);
      if (status == 0) status = encode(ctx, out, item);
      JS_FreeValue(ctx, item);
    }
  } else {
    JSPropertyEnum *properties = NULL;
    uint32_t length = 0;
    status = JS_GetOwnPropertyNames(ctx, &properties, &length, value, JS_GPN_STRING_MASK | JS_GPN_ENUM_ONLY);
    if (status == 0) status = append(out, "[\"object\",[");
    for (uint32_t i = 0; status == 0 && i < length; i++) {
      if (i != 0) status = append(out, ",");
      if (status == 0) status = append(out, "[");
      JSValue key = JS_AtomToString(ctx, properties[i].atom);
      if (status == 0) status = quote(ctx, out, key);
      JS_FreeValue(ctx, key);
      if (status == 0) status = append(out, ",");
      JSValue item = JS_GetProperty(ctx, value, properties[i].atom);
      if (status == 0) status = encode(ctx, out, item);
      JS_FreeValue(ctx, item);
      if (status == 0) status = append(out, "]");
    }
    JS_FreePropertyEnum(ctx, properties, length);
  }
  out->depth--;
  return status == 0 ? append(out, "]]") : status;
}

int main(int argc, char **argv) {
  if (argc != 3) { fputs("usage: scriptc-comptime <javascript> <timeout-ms>\n", stderr); return 2; }
  char *end = NULL;
  errno = 0;
  long timeout = strtol(argv[2], &end, 10);
  if (errno || !end || *end || timeout < 1 || timeout > 60000) {
    fputs("invalid compile-time budget\n", stderr); return 2;
  }
  FILE *file = fopen(argv[1], "rb");
  if (!file) { perror("compile-time input"); return 2; }
  if (fseek(file, 0, SEEK_END) != 0) { fclose(file); return 2; }
  long size = ftell(file);
  if (size < 0 || size > 16 * 1024 * 1024 || fseek(file, 0, SEEK_SET) != 0) { fclose(file); return 2; }
  char *source = malloc((size_t)size + 1);
  if (!source) { fclose(file); return 2; }
  if (fread(source, 1, (size_t)size, file) != (size_t)size) { free(source); fclose(file); return 2; }
  fclose(file);
  source[size] = 0;
  JSRuntime *rt = JS_NewRuntime();
  if (!rt) { free(source); return 2; }
  JS_SetMemoryLimit(rt, 256 * 1024 * 1024);
  JS_SetMaxStackSize(rt, 2 * 1024 * 1024);
  Budget budget = { now_ms() + (uint64_t)timeout, 0 };
  JS_SetInterruptHandler(rt, interrupt, &budget);
  JSContext *ctx = JS_NewContext(rt);
  if (!ctx) { JS_FreeRuntime(rt); free(source); return 2; }
  JSValue result = JS_Eval(ctx, source, (size_t)size, "comptime", JS_EVAL_TYPE_GLOBAL);
  free(source);
  int status = 0;
  Output out = {0};
  if (JS_IsException(result) || encode(ctx, &out, result) != 0) {
    free(out.data);
    memset(&out, 0, sizeof(out));
    JSValue exception = JS_GetException(ctx);
    if (budget.interrupted) status = append(&out, "[\"error\",\"ERR_SCRIPT_EXECUTION_TIMEOUT\",\"compile-time evaluation timed out\"]");
    else {
      JSValue message = JS_GetPropertyStr(ctx, exception, "message");
      JSValue detail = JS_IsUndefined(message) ? JS_IsNull(exception)
        ? JS_NewString(ctx, "compile-time result exceeds the output limit") : JS_DupValue(ctx, exception) : JS_DupValue(ctx, message);
      status = append(&out, "[\"error\",\"\",");
      if (status == 0) status = quote(ctx, &out, detail);
      if (status == 0) status = append(&out, "]");
      JS_FreeValue(ctx, detail);
      JS_FreeValue(ctx, message);
    }
    JS_FreeValue(ctx, exception);
  }
  if (status == 0 && (fwrite(out.data, 1, out.length, stdout) != out.length || fputc('\n', stdout) == EOF)) status = 2;
  free(out.data);
  JS_FreeValue(ctx, result);
  JS_FreeContext(ctx);
  JS_FreeRuntime(rt);
  return status == 0 ? 0 : 2;
}
