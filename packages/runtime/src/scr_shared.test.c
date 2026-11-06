#undef NDEBUG
#include "scr_runtime.h"
#include <assert.h>
#include <math.h>
#include <pthread.h>
#include <sched.h>
#include <stdatomic.h>
#include <stdio.h>

enum { THREADS = 4, INCREMENTS = 10000 };
static atomic_uint ready;
static atomic_bool cancel_wait;
typedef struct { ScrSharedBytes *storage; unsigned id; bool waiting; } Task;

static void *run(void *ptr) {
  Task *task = ptr;
  scr_context_enter(task->id);
  scr_init();
  scr_lib_init(0, NULL);
  ScrBytes *storage = scr_shared_wrap(task->storage);
  scr_shared_release(task->storage);
  ScrBytes *values = scr_bytes_buffer_view(storage, SCR_BYTES_I32, 4, true, 2);
  ScrBytes *view = scr_dataview_new(storage, 12, true, 4);
  ScrBytes *counter_view = scr_dataview_new(storage, 4, true, 4);
  atomic_fetch_add_explicit(&ready, 1, memory_order_release);
  if (task->waiting) {
    scr_context_stop_flag(&cancel_wait);
    ScrStr *result = scr_atomics_wait(values, 0, 0, INFINITY);
    if (task->id == 1) {
      assert(result && result->len == 2 && !memcmp(result->data, "ok", 2));
      scr_str_release(result);
    } else assert(!result && scr_context_stopping());
  } else {
    while (atomic_load_explicit(&ready, memory_order_acquire) != THREADS) sched_yield();
    for (unsigned i = 0; i < INCREMENTS; i++) {
      scr_atomics_op(values, 0, 1, 0, 4);
      /* These accesses overlap the same shared address with different view
       * metadata. Non-atomic JS accesses must still be C data-race-free. */
      scr_dataview_set(view, 0, 0x12345678, SCR_DV_U32, true);
      assert(scr_dataview_get(view, 0, SCR_DV_U32, true) == 0x12345678);
      scr_bytes_set(values, 1, -7);
      assert(scr_bytes_get(values, 1) == -7);
      if (i % 100 == 0) {
        ScrBytes *copy = scr_bytes_local_copy(storage);
        assert(!copy->shared && copy->data != storage->data && copy->len == storage->len);
        scr_bytes_release(copy);
        ScrStr *text = scr_bytes_string(storage, 0, storage->len);
        assert(text->len == storage->len);
        scr_str_release(text);
        /* Bulk reads and writes race with the lock-free Atomics updates of
         * the counter's bytes; each access is atomic, so none is a data race. */
        ScrBytes *slice = scr_bytes_slice(storage, 0, (double)storage->len);
        assert(slice->len == storage->len && !slice->shared);
        scr_bytes_release(slice);
        (void)scr_dataview_get(counter_view, 0, SCR_DV_U32, true);
        scr_bytes_release(scr_bytes_fill_num(storage, task->id, 2, 0, 4));
        scr_bytes_release(scr_bytes_copy_within(storage, 0, 2, 4));
      }
    }
  }
  scr_bytes_release(values);
  scr_bytes_release(view);
  scr_bytes_release(counter_view);
  scr_bytes_release(storage);
  scr_context_cleanup();
  return NULL;
}

/* Large shared buffers have storage of their own rather than allocator
 * storage (scr_shared_storage); they read zeroed, take plain and atomic
 * accesses, serve views over the same bytes and release cleanly. */
static void large_shared(void) {
  const size_t sizes[] = {(size_t)1 << 20, ((size_t)1 << 20) + 1, (size_t)5 << 20};
  for (unsigned k = 0; k < sizeof sizes / sizeof sizes[0]; k++) {
    size_t bytes = sizes[k];
    ScrBytes *owner = scr_bytes_new_shared(bytes, bytes);
    assert(owner && owner->len == bytes && owner->shared);
    for (size_t i = 0; i < bytes; i += 4096) assert(owner->data[i] == 0);
    assert(owner->data[bytes - 1] == 0);
    scr_bytes_set(owner, 0, 42);
    scr_bytes_set(owner, (double)bytes - 1, 7);
    ScrBytes *copy = scr_shared_wrap(owner->shared);
    assert(scr_bytes_get(copy, 0) == 42);
    assert(scr_bytes_get(copy, (double)bytes - 1) == 7);
    ScrBytes *words = scr_bytes_buffer_view(copy, SCR_BYTES_U32, 0, true, 8);
    assert(scr_atomics_op(words, 0, 5, 0, 4) == 42);
    assert(scr_bytes_get(owner, 4) == 0);
    assert(scr_atomics_op(words, 0, 1, 0, 4) == 47);
    scr_bytes_release(words);
    scr_bytes_release(copy);
    scr_bytes_release(owner);
  }
}

/* The reserved bytes past the length read zero, and the owner still holds
 * the mapping when a short shared buffer is allocated over a longer one. */
static void short_shared(void) {
  size_t bytes = 3, capacity = (size_t)5 << 20;
  ScrBytes *owner = scr_bytes_new_shared(bytes, capacity);
  assert(owner && owner->len == bytes && owner->shared);
  for (size_t i = 0; i < capacity; i += 4096) assert(owner->data[i] == 0);
  scr_bytes_set(owner, 2, 9);
  assert(scr_bytes_get(owner, 2) == 9);
  assert(owner->data[3] == 0 && owner->data[capacity - 1] == 0);
  scr_bytes_release(owner);
}

static atomic_uint f32_ready;
static atomic_bool f32_go;
static void *raw_f32_reader(void *pointer) {
  /* Raw host leases must need no source-language GC context. */
  double owner = *(double *)pointer;
  double lease = scriptc_shared_f32_retain(owner);
  assert(lease > 0);
  atomic_fetch_add_explicit(&f32_ready, 1, memory_order_release);
  while (!atomic_load_explicit(&f32_go, memory_order_acquire)) sched_yield();
  for (unsigned i = 0; i < 10000; i++) {
    double copy = scriptc_shared_f32_retain(lease);
    assert(copy > 0);
    uintptr_t address = scriptc_shared_f32_data(copy);
    uint32_t value = 0;
    assert(address);
    scr_shared_load(&value, (const void *)address, sizeof(value));
    assert(value == UINT32_C(0x3fa00000));
    assert(scriptc_shared_f32_release(copy) == 0);
  }
  assert(scriptc_shared_f32_retain(owner) == 0);
  assert(scriptc_shared_f32_release(lease) == 0);
  return NULL;
}

static unsigned observer_a_calls, observer_b_calls;
static void observer_a(void *object) { (void)object; observer_a_calls++; scr_weak_observer_remove(observer_a); }
static void observer_b(void *object) { (void)object; observer_b_calls++; }
static void raw_f32_registry(void) {
  void (*saved_hook)(void *) = scr_weak_dispose_hook;
  scr_weak_observer_install(observer_a);scr_weak_observer_install(observer_b);
  scr_weak_observer_install(observer_b); /* idempotent */
  int token = 0;scr_weak_dispose(&token);
  assert(observer_a_calls == 1 && observer_b_calls == 1);
  scr_weak_dispose(&token);
  assert(observer_a_calls == 1 && observer_b_calls == 2);
  scr_weak_observer_remove(observer_b);
  assert(scr_weak_dispose_hook == saved_hook);
  double held = scr_array_buffers_held(true);
  for (size_t i = 0; i < 1000; i++) {
    double handle = scriptc_shared_f32_new(4);
    assert(handle > 0);
    ScrBytes *left = scr_shared_f32_view(handle), *right = scr_shared_f32_view(handle);
    ScrBytes *input = scr_shared_f32_readonly_view(handle);
    ScrBytes *part = scr_bytes_subarray(input, 1, 3);
    assert(left != right && left->backing == right->backing);
    assert(!left->shared_readonly && !right->shared_readonly && !left->backing->shared_readonly);
    assert(input->shared_readonly && input->backing == left->backing);
    assert(part->shared_readonly && part->data == input->data + sizeof(float));
    assert(scriptc_shared_f32_release(handle) == 0);
    scr_bytes_release(left);scr_bytes_release(right);
    assert(input->len == 4 && part->len == 2);
    scr_bytes_release(input);scr_bytes_release(part);
    assert(scr_array_buffers_held(true) == held && scr_weak_dispose_hook == saved_hook);
  }
  double owner = scriptc_shared_f32_new(1);
  assert(owner > 0 && scr_array_buffers_held(true) == held + 4);
  uint32_t value = UINT32_C(0x3fa00000);
  scr_shared_store((void *)scriptc_shared_f32_data(owner), &value, sizeof(value));
  pthread_t readers[4];
  for (size_t i = 0; i < 4; i++) assert(pthread_create(&readers[i], NULL, raw_f32_reader, &owner) == 0);
  while (atomic_load_explicit(&f32_ready, memory_order_acquire) != 4) sched_yield();
  assert(scriptc_shared_f32_release(owner) == 0);
  atomic_store_explicit(&f32_go, true, memory_order_release);
  for (size_t i = 0; i < 4; i++) assert(pthread_join(readers[i], NULL) == 0);
  assert(scr_array_buffers_held(true) == held);
  double handles[4096];
  for (size_t i = 0; i < 4096; i++) {handles[i] = scriptc_shared_f32_new(0); assert(handles[i] > 0);}
  assert(scriptc_shared_f32_new(1) == 0);
  double stale = handles[0];
  assert(scriptc_shared_f32_release(stale) == 0);
  double replacement = scriptc_shared_f32_new(1);
  assert(replacement > 0 && replacement != stale && scriptc_shared_f32_length(stale) == -1);
  for (size_t i = 1; i < 4096; i++) assert(scriptc_shared_f32_release(handles[i]) == 0);
  assert(scriptc_shared_f32_release(replacement) == 0);
  assert(scr_array_buffers_held(true) == held);
}

int main(void) {
  scr_init();
  scr_lib_init(0, NULL);
  large_shared();
  short_shared();
  ScrBytes *storage = scr_bytes_new(SCR_BYTES_U8, 16);
  scr_bytes_make_shared(storage);
  ScrBytes *values = scr_bytes_buffer_view(storage, SCR_BYTES_I32, 4, true, 2);
  scr_bytes_require_unshared(values);
  assert(scr_exc_pending());
  scr_exc_clear();
  ScrBytes *local = scr_bytes_new(SCR_BYTES_U8, 2);
  ScrBytes *retained = scr_bytes_local_copy(local);
  assert(retained == local);
  scr_bytes_require_unshared(local);
  assert(!scr_exc_pending());
  scr_bytes_release(retained);
  scr_bytes_release(local);
  pthread_t threads[THREADS];
  Task tasks[THREADS];
  for (unsigned i = 0; i < THREADS; i++) {
    tasks[i] = (Task){scr_shared_retain(storage->shared), i + 1, false};
    assert(!pthread_create(&threads[i], NULL, run, &tasks[i]));
  }
  for (unsigned i = 0; i < THREADS; i++) assert(!pthread_join(threads[i], NULL));
  assert(scr_bytes_get(values, 0) == THREADS * INCREMENTS);
  assert(scr_atomics_op(values, 0, 3.9, 0, 1) == 3);
  assert(scr_atomics_op(values, 0, 3, 0xffffffff, 3) == 3);
  assert(scr_atomics_op(values, 0, 0, 0, 0) == -1);
  assert(scr_atomics_op(values, 0, 0, 0, 2) == -1);
  ScrStr *status = scr_atomics_wait(values, 0, 1, INFINITY);
  assert(status && !strcmp(status->data, "not-equal"));
  scr_str_release(status);
  status = scr_atomics_wait(values, 0, 0, 0);
  assert(status && !strcmp(status->data, "timed-out"));
  scr_str_release(status);

  tasks[0] = (Task){scr_shared_retain(storage->shared), 1, true};
  assert(!pthread_create(&threads[0], NULL, run, &tasks[0]));
  double deadline = scr_perf_now() + 5000;
  while (scr_atomics_notify(values, 0, 1) == 0) {
    assert(scr_perf_now() < deadline);
    sched_yield();
  }
  assert(!pthread_join(threads[0], NULL));
  assert(scr_atomics_notify(values, 0, INFINITY) == 0);

  tasks[0] = (Task){scr_shared_retain(storage->shared), 2, true};
  assert(!pthread_create(&threads[0], NULL, run, &tasks[0]));
  atomic_store_explicit(&cancel_wait, true, memory_order_relaxed);
  assert(!pthread_join(threads[0], NULL));
  assert(scr_atomics_notify(values, 0, INFINITY) == 0);
  scr_bytes_release(values);
  scr_bytes_release(storage);
  double handle = scriptc_shared_f32_new(16);
  assert(handle > 0 && scriptc_shared_f32_length(handle) == 16);
  ScrBytes *view = scr_shared_f32_view(handle);
  assert(view && view->elem == SCR_BYTES_F32 && view->len == 16);
  double lease = scriptc_shared_f32_retain(handle);
  assert(lease > 0 && lease != handle);
  uintptr_t pointer = scriptc_shared_f32_data(lease);
  assert(pointer != 0);
  assert(scriptc_shared_f32_release(handle) == 0);
  assert(scriptc_shared_f32_release(handle) == -1);
  assert(scriptc_shared_f32_length(handle) == -1);
  assert(scriptc_shared_f32_data(lease) == pointer);
  scr_bytes_set(view, 0, 1.25);
  assert(scr_bytes_get(view, 0) == 1.25);
  assert(scriptc_shared_f32_release(lease) == 0);
  // A context-local view is still an owner after every handle is gone.
  assert(scr_bytes_get(view, 0) == 1.25);
  scr_bytes_release(view);
  assert(scriptc_shared_f32_new(-1) == 0);
  assert(scriptc_shared_f32_new(NAN) == 0);
  assert(scriptc_shared_f32_release(INFINITY) == -1);
  raw_f32_registry();
  scr_context_cleanup();
  puts("shared views preserve atomic updates, wait queues and cancellation ownership");
}
