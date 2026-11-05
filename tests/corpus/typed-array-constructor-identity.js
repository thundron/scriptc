// @ts-nocheck
/** @param {unknown} value */
function identify(value) {
  const ctor = value.constructor;
  if (ctor === Uint8Array) return 'u8';
  if (ctor === Uint8ClampedArray) return 'u8c';
  if (ctor === Int8Array) return 'i8';
  if (ctor === Uint16Array) return 'u16';
  if (ctor === Int16Array) return 'i16';
  if (ctor === Uint32Array) return 'u32';
  if (ctor === Int32Array) return 'i32';
  if (ctor === Float32Array) return 'f32';
  if (ctor === Float64Array) return 'f64';
  if (ctor === Buffer) return 'buffer';
  return 'other';
}
console.log(identify(new Uint8Array()), identify(new Uint8ClampedArray()), identify(new Int8Array()));
console.log(identify(new Uint16Array()), identify(new Int16Array()), identify(new Uint32Array()), identify(new Int32Array()));
console.log(identify(new Float32Array()), identify(new Float64Array()), identify(Buffer.from([1, 2])));
