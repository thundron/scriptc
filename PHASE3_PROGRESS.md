# Phase 3 progress — browser wasm reactor + host-import ABI (fork `internal`)

Goal: let scriptc emit a **browser wasm reactor** (init-then-return, callable
exports) that calls **host JS imports** over a ptr+len linear-memory ABI, so the
nativetron framework can run *compiled* in the browser. Design: see the
nativetron repo `docs/PHASE3_WASM_SPIKE.md`.

This branch (`internal`) is our base of record. `main` mirrors `upstream/main`;
we periodically merge `upstream/main` into `internal`.

## Done

### Toolchain mechanic — VERIFIED end-to-end (with zig)
A hand-written C reactor confirmed the exact incantation the emitter/linker must
produce (no scriptc changes needed for these to work):

- Link: `zig cc -target wasm32-wasi -O2 -mexec-model=reactor -Wl,--no-entry`
  → module exports `memory` + `_initialize` (crt reactor hook that runs ctors,
  no `proc_exit`) and omits `_start`.
- Exports: `__attribute__((export_name("...")))` on each app function +
  `scr_wasm_alloc`/`scr_wasm_free`.
- Host imports: `__attribute__((import_module("nt"), import_name("...")))`
  → wasm-ld leaves them as imports (`nt.dom_set_text`); unused WASI imports are
  tree-shaken at `-O2`.
- One-time init: a `__attribute__((constructor))` runs when the host calls
  `_initialize()`. Do **not** define your own `_initialize` (crt provides it).
- Full round-trip proven: host stages a string via `scr_wasm_alloc` → calls
  exported `onClick(ptr,len)` → guest calls imported host fn → host reads the
  string back. The DOM Host ABI ptr+len contract works verbatim over wasm.

### Landed compiler code
- `packages/compiler/src/backend/wasm-glue.ts` — `emitWasmGlue(mod)`: pure
  string emission of the `<stem>.mjs` ESM loader from the IR-derived
  import/export surface. Marshals string/bytes as (ptr,len) over linear memory,
  stages host→guest args via `scr_wasm_alloc`, runs `_initialize`, exposes
  export wrappers. `instantiate()` (browser, fetch) + `instantiateFromBytes()`
  (Node/browser core). Refuses string/bytes *results* (matches the FFI rule).
- `packages/compiler/src/backend/wasm-glue.test.ts` — 6 tests: unit assertions
  on the generated glue, plus an **end-to-end** test (gated on `zig`) that builds
  the real reactor, generates glue for its ABI, imports the ESM, and runs the
  host↔guest round-trip. All green.

## Remaining (from the spike plan)

- **PR1 emitter/link wiring** — drive the above attributes/flags from scriptc:
  when `wasi` + a reactor/export surface, emit `export_name` (LLVM
  `wasm-export-name` attr or `-Wl,--export`) on exported fns + the allocator
  shim, add `-mexec-model=reactor -Wl,--no-entry` to the wasm link
  (`native-toolchain.ts`), and un-gate the wasi library/reactor refusal
  (`index.ts` ~L2625). Decide export-selection source (library profile vs. a new
  reactor manifest).
- **`scr_wasm_alloc`/`scr_wasm_free` runtime shim** in the C runtime, gated to
  the wasi reactor lane.
- **PR2 host imports** — un-gate the wasi FFI refusal (`index.ts:1523`); attach
  `wasm-import-module`/`wasm-import-name` attributes to `mod.ffiImports`
  declares; restrict to FFI formats 1–3 (refuse retained/foreign on wasm).
- **PR3 wiring** — call `emitWasmGlue` in the wasm artifact step and write
  `<stem>.mjs` beside `<stem>.wasm`.
- **Minimal WASI shim** for the browser host (reactor still links wasi-libc),
  or migrate to freestanding `wasm32-unknown` later.
</content>
