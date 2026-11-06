# @scriptc/experimental

Experimental scriptc APIs. Each export has a Node.js implementation, so programs that use them run unchanged under Node.js.

## LifetimeRegion

Instances of `ProgramLifetime` classes (`@scriptc/types`) are never freed in scriptc builds. A `LifetimeRegion` gives a long-running program a way to free a whole generation of them at once, for example the previous program of a compiler's watch mode.

```ts
import { LifetimeRegion } from "@scriptc/experimental";

let previous: LifetimeRegion | undefined;
function rebuild(): Program {
  const region = new LifetimeRegion();
  const program = region.run(() => buildProgram());
  previous?.release();
  previous = region;
  return program;
}
```

- `run(fn)` calls `fn` with the region as the current region and returns its result. `ProgramLifetime` instances created during the call belong to the region; calls nest.
- Instances created outside every `run` call belong to the default region, which is never freed.
- Async work started inside `fn` keeps its region: what it creates after an `await` belongs to the region too, and the region is not freed before that work has finished.
- `release()` requests that the region be freed. scriptc frees it once nothing outside the region refers to any of its instances; until then the region stays allocated. Later `run` calls on a released region allocate in the default region.
- A region that holds a published object (`@scriptc/threads`) is never freed.

Under Node.js, `run(fn)` returns `fn()` and `release()` does nothing.

## Binary32 arithmetic

Import explicit single-precision operations from `@scriptc/experimental/f32`. Each operation rounds its operands and result to binary32. Ordinary `number` expressions retain their JavaScript binary64 semantics, and embedding arguments remain binary64. Operations do not enable fast math or multiply-add fusion. `min` and `max` propagate NaNs and preserve the JavaScript signed-zero rules. NaN payload bits are not part of the contract.

The compiler can also use binary32 instructions in ordinary code when it proves the result is unchanged: `Math.min` and `Math.max` of exactly representable binary32 values, or addition, subtraction, and multiplication of those values at a `Math.fround` boundary or a statement-only Float32Array store. An assignment expression's returned value remains unrounded binary64. Other arithmetic, including ordinary division, keeps its binary64 path.

```ts
import { add, mul, add4 } from "@scriptc/experimental/f32";

const value = add(mul(1.1, 2.2), 1.1);
const left = new Float32Array([1, 2, 3, 4]);
const right = new Float32Array([5, 6, 7, 8]);
const output = new Float32Array(4);
add4(output, 0, left, 0, right, 0);
```

Scalar exports are `round`, `add`, `sub`, `mul`, `div`, `rem`, `sqrt`, `abs`, `neg`, `min`, and `max`. The four-lane forms are `add4`, `sub4`, `mul4`, `div4`, `min4`, and `max4`; their arguments are `(output, outputIndex, left, leftIndex, right, rightIndex)`. They read all input lanes before writing output, including overlapping views. Invalid element indices retain JavaScript's NaN/ignored-write behavior. Programs that resize or detach ArrayBuffers cannot use these vector operations.

## Wasm SIMD and shared-memory jobs

A library profile can opt into SIMD with `abi.wasm_features: ["simd128"]`. Use explicit four-lane operations for binary32 vector computation. The generated host checks SIMD support before instantiation; build a separate scalar artifact for hosts without it.

For a shared-memory library, add these fields inside the profile's `abi` object:

```json
{
  "instance_per_thread": true,
  "wasm_features": ["simd128"],
  "wasm_memory": {
    "shared": true,
    "initial_pages": 256,
    "maximum_pages": 4096,
    "stack_bytes": 1048576
  }
}
```

The generated `.mjs` and `.d.mts` files expose `createRuntime`. In browsers, host it in a dedicated Worker with cross-origin isolation (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`). GPU ownership stays with your existing page or engine Worker; the pthread workers run CPU jobs. A scalar counterpart uses the same source and exports, with `instance_per_thread: false`, `wasm_memory.shared: false`, and no SIMD feature.

For a profile exporting `work(handle, start, end)`, submit its buffer as an object so the runtime retains a lease until the job finishes:

```ts
import { createRuntime } from "./kernel-threaded.mjs";
import { createRuntime as createScalarRuntime } from "./kernel-scalar.mjs";

const threadedBytes = await (await fetch("./kernel-threaded.wasm")).arrayBuffer();
const scalarBytes = await (await fetch("./kernel-scalar.wasm")).arrayBuffer();
const runtime = await createRuntime(threadedBytes, {}, {
  workers: 4,
  fallback: () => createScalarRuntime(scalarBytes),
});
try {
  const buffer = runtime.buffer(1024); // Float32 elements, not bytes
  buffer.writeFloat32(new Float32Array(1024));
  await runtime.call("work", [buffer, 0, buffer.length]);
  const snapshot = buffer.readFloat32(); // owned copy
  buffer.release();
} finally {
  await runtime.close();
}
```

Inside compiled source, `shared(handle)` returns a context-local Float32Array view. `allocateShared(length)` and `releaseShared(handle)` manage raw, runtime-scoped handles; existing views remain valid after a handle is released. Raw numeric handles require caller-managed job lifetimes. Shared backing is atomic-owned; mutable objects, closures, globals, and GC roots remain private to each worker. Four-lane operations on mutable shared views retain their atomic gather/scatter paths.

Use `sharedReadOnly(handle)` only with an explicit immutable-input contract: exclude writes through every alias and from every agent while compiled code can read the view, including concurrent jobs. Do not write through the returned view or derived aliases. The function does not freeze storage or synchronize writers; violating the contract is unsupported. It enables non-atomic scalar reads and direct four-lane loads for complete in-range inputs when the output is thread-local. Four-lane writes to shared outputs still use atomic scatter. A `Readonly<Float32Array>` annotation alone does not establish this concurrency contract.

Jobs carry at most 64 KiB of serialized control data; use buffer handles for bulk geometry. `workers` accepts 1–64, and the pending queue defaults to eight jobs per worker. `timeoutMs` and an `AbortSignal` bound shared jobs. Once a job is admitted, a timeout or abort discards the pool and its memory, as does a trap or close with pending jobs; create a fresh runtime afterward. Scalar calls execute synchronously in their hosting context and cannot be interrupted by its own timer. `memoryBytes` reports linear-memory size, not process RSS. Host-import returns remain scalar-only, and callback buffers remain read-only.

Profiles with host callbacks also need `workerHostModule`, a module exporting `createHost({slot, memory})`, to supply each worker's callbacks. Shared source initialization runs in each worker, not in the controller. The generated `requiredFeatures`, `memoryABI`, and runtime `capabilities` describe the selected artifact and execution mode.

Building the WASI runtime pack with its `build:native` script includes pthread library flavors. The build uses SHA-256-pinned WASI SDK 31, or an explicit `WASI_SDK_PATH`; a non-pinned SDK also needs `WASI_THREADS_LICENSE_FILE`. `SCRIPTC_WASI_THREADS=0` builds a scalar-only development pack. Consumers need neither the SDK nor another application runtime dependency: the pack carries the threaded libc, CRT, compiler builtins, and redistribution notices.

In scriptc builds, `SCRIPTC_REGION_STATS=1` reports every release attempt on stderr.

## InternTable

An `InternTable` is a named, append-only table of published values (`@scriptc/threads`) that every thread of a scriptc program shares. Threads that build the same cache (interned types, strings, resolved modules) fill and read one table instead of one copy each.

```ts
import { InternTable } from "@scriptc/experimental";

class Type {
  readonly id: number;
  readonly members: readonly Type[];
  constructor(id: number, members: readonly Type[]) {
    this.id = id;
    this.members = members;
  }
}

// Module scope: every thread that evaluates this line opens the same table.
const unions = new InternTable<string, Type>("checker.unions");

function unionOf(members: readonly Type[]): Type {
  const key = members.map((m) => m.id).join(",");
  return unions.getOrInsertComputed(key, () => new Type(nextId(), members));
}
```

- `new InternTable<K, V>(name)` opens the table called `name`. Within one thread, every construction with the same name refers to the same table. In scriptc builds the table is shared by every thread of the process; under Node.js each thread has its own.
- Keys are strings, numbers, or arrays of numbers or of strings. Strings and numbers compare like `Map` keys: strings by content, numbers by SameValueZero. Arrays compare by their elements in the same way, so a freshly built `[a.id, b.id]` finds the value stored under an equal array; holes are equal to each other and to no number or string. An array key can have at most 65536 elements; longer ones make every method throw a `TypeError`.
- `get(key)`, `has(key)` and `size` read the table.
- `getOrInsert(key, value)` returns the value stored under `key`. When there is none, it publishes `value`, stores it and returns it.
- `getOrInsertComputed(key, callback)` returns the value stored under `key`. When there is none, it calls `callback(key)`, publishes the result and stores it, unless a value was stored under `key` meanwhile (by the callback, or in scriptc builds by another thread), and returns the stored value.
- A key's value never changes once stored, and there is no `set` or `delete`. Stored values and everything they reach are immutable; a value that `publish` refuses makes the call throw the same `TypeError` and stores nothing.
- No lock is held while a callback runs. Threads that miss one key at the same time may each call the callback; one result is stored and every call returns it.

scriptc requires the name to be a string literal, and every construction of one name in a program to use the same type arguments. Values must be numbers, booleans, strings, bigints, arrays, `Map`s, `Set`s, objects or class instances.

Programs that behave identically under scriptc and Node.js follow the `@scriptc/threads` rules and three more:

1. A stored value does not depend on which thread created it. In scriptc a value may come from another thread's callback.
2. Identity and ids are not compared across threads. Ids assigned inside callbacks are unique in both runtimes but differ between them.
3. A thread does not depend on another thread's inserts. `size` and `has` reflect every thread's inserts in scriptc and the calling thread's under Node.js.

Per-thread state about a shared value (lazily computed results, caches) belongs in thread-local state, for example a `ThreadSlots` family (below), a module-level `Map` keyed by the value, or an array indexed by an id the value carries: module state is per thread in both runtimes. In scriptc an array indexed by a dense id is the fastest of these.

In scriptc builds stored values are immortal: they stay allocated until the process exits, including values a callback computed for a key that another thread stored first.

## ThreadSlots

A `ThreadSlots` family holds one value per key and thread, like a `WeakMap` that each thread has its own copy of. A thread sees only the values it set, including for keys that every thread shares, such as values read from an `InternTable`, and setting a value never writes the key.

```ts
import { InternTable, ThreadSlots } from "@scriptc/experimental";

class Type {
  readonly id: number;
  constructor(id: number) {
    this.id = id;
  }
}

class TypeState {
  resolved = false;
}

const types = new InternTable<number, Type>("checker.types");
// Module scope: every thread that evaluates this line opens the same family.
const states = new ThreadSlots<Type, TypeState>("checker.typeStates");

function stateOf(t: Type): TypeState {
  let state = states.get(t);
  if (state === undefined) {
    state = new TypeState();
    states.set(t, state);
  }
  return state;
}
```

- `new ThreadSlots<K, V>(name)` opens the family called `name`. Within one thread, every construction with the same name refers to the same family.
- `get(key)` and `has(key)` read the calling thread's value for `key`.
- `set(key, value)` sets the calling thread's value and returns the slots.
- `delete(key)` removes the calling thread's value and returns whether there was one.

scriptc requires the name to be a string literal, every construction of one name to use the same type arguments, the key type to be a class declared in the program (keys may be instances of its subclasses), and the value type to be a class, an object type, an array, a `Map` or a `Set`. The methods must be called through a module-level `const` initialized with `new ThreadSlots<K, V>("name")`, since a family's storage is found by its name when the program is compiled.

In scriptc builds every instance of a key class's hierarchy carries a 4-byte slot index, assigned by the first `set` for it and never reused. `get` reads the index, a page of the thread's family and the entry, with no lock, hash or atomic update. A family holds a reference to each of the thread's values and releases it when it is replaced or deleted, when its key is freed, and when the thread exits. Keys freed with a `LifetimeRegion` keep their values until the thread exits, a value that belongs to a region keeps the region allocated while the family holds it, and a value that refers to its own key keeps the key alive.

Under Node.js each family is a `WeakMap` per thread.

## InlineArray

`InlineArray<T>` marks an array field of a `ProgramLifetime` class (`@scriptc/types`) whose elements scriptc keeps in the instance itself, after its other fields, instead of in an array object of their own. It suits a program with millions of short arrays that never change once built, such as the children of each node of a syntax tree.

```ts
import type { ProgramLifetime } from "@scriptc/types";
import type { InlineArray } from "@scriptc/experimental";

class NodeList implements ProgramLifetime {
  readonly pos: number;
  readonly nodes: InlineArray<Node>;
  constructor(pos: number, nodes: readonly Node[]) {
    this.pos = pos;
    this.nodes = nodes;
  }
}

function visit(list: NodeList): void {
  const nodes = list.nodes;
  for (let i = 0; i < nodes.length; i++) visitNode(nodes[i]!);
}
```

- `T` is a `ProgramLifetime` class, and the field is an instance field of a `ProgramLifetime` class.
- The constructor of the class that declares the field writes it once, from one of its parameters. A subclass constructor passes one of its own parameters there through `super(...)`. Nothing else writes the field.
- Indexing the field, reading its `length` and iterating it with `for...of` read the elements from the instance, directly or through a `const` local used only in those ways. Any other use, such as passing the field to a function or calling one of its methods, gets an array of the elements, which is frozen in scriptc builds.
- The array passed to the constructor is one that nothing else keeps: a new array (a literal, a copy, or the result of a function that returns only such arrays or its own argument), a local array at its last use, a parameter whose callers each pass such an array, an array that an InlineArray field already holds, or a `const` array that is never written.
- The arrays fields hold are never written, through a read of the field (a cast) or through any other reference. scriptc follows them through locals, parameters, return values, fields, the elements of arrays, Maps and Sets, and closures, and reports one that reaches a write, a dynamic value (also inside the fields of an object that becomes one), a call through a function value (also inside an array, Map or Set passed there), or a library call other than printing and `JSON.stringify` without a replacer.
- Two reads of the field need not give the same array, so the arrays fields hold are never compared by identity: with `===` or `!==`, as an `indexOf` or `includes` argument, or as a Map key or Set element. Compare the elements instead, or keep a copy made with `slice()` where identity matters.
- Instances of the class are not constructed through a class value. They may become dynamic values, for example through a conversion to `unknown` or an interface several classes implement, when the dynamic code that sees them uses the class's own members and does not read the field: scriptc follows such values through locals, parameters, return values, fields, the elements of arrays, Maps and Sets, the members of dynamic objects and arrays, calls through function values, and the callbacks of array methods such as `map` and `forEach`, and finds the first that reaches a read or write of the field's name or of a computed key, a checked cast to a record, array or collection type that has a record member of the field's name or holds a dynamic value, a call through a value no compiled function reaches (also as an array method's callback), or a library call other than printing, `JSON.stringify` without a replacer, `publish`, a worker's `workerData`, and class tests and casts. A dynamic view of an inline field would read it as a new array each time, so when such an operation exists the field keeps its elements in an ordinary array, which behaves as under Node.js, and scriptc reports a warning (SC6105).

scriptc reports a field that does not keep these rules (SC7009). Under Node.js the field holds the array the constructor stored. In builds with sanitizers, in programs that use `LifetimeRegion`, and on platforms other than 64-bit Linux, the elements stay in an ordinary array object.
