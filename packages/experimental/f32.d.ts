/** Explicit IEEE-754 binary32 arithmetic. Every operand is rounded to binary32
 * before the operation, and the result is rounded to binary32 afterwards.
 * Ordinary JavaScript `number` expressions retain their binary64 semantics.
 * Node.js uses the JavaScript reference implementation; scriptc emits float
 * arithmetic, retaining binary64 at ordinary number/embedding boundaries.
 * Operations are not fused and do not enable unsafe/fast math. */
export declare function round(a: number): number;
export declare function add(a: number, b: number): number;
export declare function sub(a: number, b: number): number;
export declare function mul(a: number, b: number): number;
export declare function div(a: number, b: number): number;
export declare function rem(a: number, b: number): number;
export declare function sqrt(a: number): number;
export declare function abs(a: number): number;
export declare function neg(a: number): number;
/** NaN propagates. The minimum of either signed zero and -0 is -0. */
export declare function min(a: number, b: number): number;
/** NaN propagates. The maximum of either signed zero and +0 is +0. */
export declare function max(a: number, b: number): number;

/** Four independent binary32 lanes. Read all four values of both inputs
 * before writing output, so aliased/overlapping views are supported. Indices
 * are element indices, not byte offsets. Like ordinary typed-array access,
 * missing input elements become NaN and invalid output indices are ignored.
 * Fixed, non-detached Float32Array views are required in compiled builds.
 * With abi.wasm_features=["simd128"], wasm libraries use SIMD128; without
 * that opt-in the same program remains valid on scalar wasm runtimes. */
export declare function add4(
  out: Float32Array,
  at: number,
  left: Float32Array,
  li: number,
  right: Float32Array,
  ri: number,
): void;
export declare function sub4(
  out: Float32Array,
  at: number,
  left: Float32Array,
  li: number,
  right: Float32Array,
  ri: number,
): void;
export declare function mul4(
  out: Float32Array,
  at: number,
  left: Float32Array,
  li: number,
  right: Float32Array,
  ri: number,
): void;
export declare function div4(
  out: Float32Array,
  at: number,
  left: Float32Array,
  li: number,
  right: Float32Array,
  ri: number,
): void;
export declare function min4(
  out: Float32Array,
  at: number,
  left: Float32Array,
  li: number,
  right: Float32Array,
  ri: number,
): void;
export declare function max4(
  out: Float32Array,
  at: number,
  left: Float32Array,
  li: number,
  right: Float32Array,
  ri: number,
): void;

/** Allocate zeroed neutral binary32 storage and return an opaque owning handle.
 * Release the handle exactly once. Up to 4096 live handles are supported;
 * released handles are never silently reused. Handles are not raw pointers. */
export declare function allocateShared(length: number): number;
/** Create a context-local view retaining the storage. Existing views remain
 * valid when the owning handle is released; new lookups of it then fail.
 * Only the backing numeric bytes, not JavaScript/GC graphs, are shared. */
export declare function shared(handle: number): Float32Array;
/** Assert the immutable-input contract for a shared view. You must exclude
 * writes through every alias and from every agent while compiled code can
 * read this view, including concurrent jobs. This enables non-atomic scalar
 * and SIMD loads. It does not freeze the storage or synchronize writers.
 * Do not use the view or a derived alias to write. Violating this contract
 * is unsupported; use shared() when other agents may write concurrently. */
export declare function sharedReadOnly(handle: number): Readonly<Float32Array>;
/** Release an owning handle. Invalid/stale/double releases throw RangeError. */
export declare function releaseShared(handle: number): void;
