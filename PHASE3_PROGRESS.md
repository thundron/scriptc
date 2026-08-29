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
- `packages/runtime/src/scr_wasm.c` — the wasm reactor staging allocator
  (`scr_wasm_alloc`/`scr_wasm_free`, `export_name` under `__wasm__`). Lets the
  browser host hand inbound strings/bytes into guest linear memory.
- `packages/compiler/src/backend/native-toolchain.ts` — `wasmReactorLinkArgs()`
  (pure): emits `-mexec-model=reactor -Wl,--no-entry` + one `-Wl,--export=` per
  app export and per support export (`scr_wasm_alloc/free`); `memory` and
  `_initialize` are surfaced implicitly (linker/crt) and must NOT be `--export`ed.
  Plus `WASM_REACTOR_RUNTIME_SOURCES` / `WASM_REACTOR_SUPPORT_EXPORTS`.
  `backend/wasm-reactor.test.ts`: 5 tests incl. an end-to-end zig build proving
  `scr_wasm.c` compiles for wasm32-wasi, exports alloc/free, and its pointers
  address writable guest memory (round-trip sum check).
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

### TS -> reactor: PROVEN end-to-end
`scriptc build --lib --profile p.json` on wasm32-wasi emits the reactor `.ll`;
linking it with the library runtime (LIB set + `scr_wasm.c`, `-DSCR_LIB`, wasi
emulation defines `_WASI_EMULATED_SIGNAL/PROCESS_CLOCKS/GETPID`) via
`wasmReactorLinkArgs()` yields a `.wasm` whose compiled-TS exports run from JS:
`kt_add(2,3)=5`, `passthrough`, `negZero=-0`, `isNan`, `invert`, `plumb`.
Locked in `backend/wasm-reactor-e2e.test.ts` (zig-gated). Required a wasm
fallback for `SCR_TRAP_ADDR` in `scr_library.c`.

## Remaining (from the spike plan)

- **`console.log` on wasm**: the emitter declares `scr_console_log(i64, ptr)`
  but the runtime is `(size_t=i32, ptr)`; a signature mismatch traps only the
  logging path. Fix = emit size_t-class runtime-ABI args as i32 under wasi.
- **Host imports (PR2)**: un-gate the wasi FFI refusal (`index.ts:1523`) and
  attach `wasm-import-module`/`wasm-import-name` to FFI declares so compiled TS
  can call host JS (the DOM). Glue import wiring already exists.

### DONE: `scriptc build --lib` on wasm32-wasi emits `.wasm` + `.mjs` directly
`buildWasmReactor()` (native-toolchain) compiles the `.ll` + library runtime +
`scr_wasm.c` and links the reactor; `index.ts` wires it and writes the
`emitWasmGlue` loader (with a built-in WASI shim, so `console.log` works). The
generated glue runs compiled TS: `kt_add(2,3)=5`, etc. Locked in
`backend/wasm-reactor-build.test.ts` (zig-gated).

- **PR2 host imports** — un-gate the wasi FFI refusal (`index.ts:1523`); attach
  `wasm-import-module`/`wasm-import-name` attributes to `mod.ffiImports`
  declares; restrict to FFI formats 1–3 (refuse retained/foreign on wasm).
- **PR3 wiring** — call `emitWasmGlue` in the wasm artifact step and write
  `<stem>.mjs` beside `<stem>.wasm`.
- **Minimal WASI shim** for the browser host (reactor still links wasi-libc),
  or migrate to freestanding `wasm32-unknown` later.
</content>
