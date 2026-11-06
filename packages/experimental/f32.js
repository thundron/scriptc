// Each operation rounds its operands and result to IEEE-754 binary32.
// scriptc lowers these calls to float instructions, without loading this file.
const f = Math.fround;
export function round(a) {
  return f(a);
}
export function add(a, b) {
  return f(f(a) + f(b));
}
export function sub(a, b) {
  return f(f(a) - f(b));
}
export function mul(a, b) {
  return f(f(a) * f(b));
}
export function div(a, b) {
  return f(f(a) / f(b));
}
export function rem(a, b) {
  return f(f(a) % f(b));
}
export function sqrt(a) {
  return f(Math.sqrt(f(a)));
}
export function abs(a) {
  return Math.abs(f(a));
}
export function neg(a) {
  return -f(a);
}
export function min(a, b) {
  return Math.min(f(a), f(b));
}
export function max(a, b) {
  return Math.max(f(a), f(b));
}

function lanes(operation, out, at, left, li, right, ri) {
  // All inputs are read before any output, including overlapping views.
  const a0 = f(left[li]),
    a1 = f(left[li + 1]),
    a2 = f(left[li + 2]),
    a3 = f(left[li + 3]);
  const b0 = f(right[ri]),
    b1 = f(right[ri + 1]),
    b2 = f(right[ri + 2]),
    b3 = f(right[ri + 3]);
  out[at] = operation(a0, b0);
  out[at + 1] = operation(a1, b1);
  out[at + 2] = operation(a2, b2);
  out[at + 3] = operation(a3, b3);
}
export function add4(out, at, left, li, right, ri) {
  lanes(add, out, at, left, li, right, ri);
}
export function sub4(out, at, left, li, right, ri) {
  lanes(sub, out, at, left, li, right, ri);
}
export function mul4(out, at, left, li, right, ri) {
  lanes(mul, out, at, left, li, right, ri);
}
export function div4(out, at, left, li, right, ri) {
  lanes(div, out, at, left, li, right, ri);
}
export function min4(out, at, left, li, right, ri) {
  lanes(min, out, at, left, li, right, ri);
}
export function max4(out, at, left, li, right, ri) {
  lanes(max, out, at, left, li, right, ri);
}

const sharedSlots = new Array(4096);
const sharedGenerations = new Uint32Array(4096);
let sharedNext = 0;
function sharedSlot(handle) {
  if (!Number.isSafeInteger(handle) || handle <= 0 || handle > 2 ** 44) return null;
  const index = (handle - 1) % 4096,
    generation = Math.floor((handle - 1) / 4096);
  return sharedGenerations[index] === generation && sharedSlots[index] !== undefined
    ? { index, buffer: sharedSlots[index] }
    : null;
}
export function allocateShared(length) {
  if (!Number.isInteger(length) || length < 0 || length > 1073741823)
    throw new RangeError("shared float32 allocation failed");
  let buffer;
  try {
    buffer = new (typeof SharedArrayBuffer === "function" ? SharedArrayBuffer : ArrayBuffer)(
      length * 4,
    );
  } catch {
    throw new RangeError("shared float32 allocation failed");
  }
  for (let n = 0; n < 4096; n++) {
    const i = (sharedNext + n) % 4096;
    if (sharedSlots[i] !== undefined || sharedGenerations[i] === 0xffffffff) continue;
    sharedGenerations[i]++;
    sharedSlots[i] = buffer;
    sharedNext = (i + 1) % 4096;
    return sharedGenerations[i] * 4096 + i + 1;
  }
  throw new RangeError("shared float32 allocation failed");
}
export function shared(handle) {
  const slot = sharedSlot(handle);
  if (!slot) throw new RangeError("invalid shared float32 handle");
  return new Float32Array(slot.buffer);
}
export function releaseShared(handle) {
  const slot = sharedSlot(handle);
  if (!slot) throw new RangeError("invalid shared float32 handle");
  sharedSlots[slot.index] = undefined;
}
