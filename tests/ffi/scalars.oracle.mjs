// Node's typed-array conversions provide an independent oracle for the native
// ABI's modulo integer conversions and IEEE-754 single-precision rounding.
globalThis.nativeF32 = Math.fround;
globalThis.nativeI8 = (value) => new Int8Array([value])[0];
globalThis.nativeU16 = (value) => new Uint16Array([value])[0];
globalThis.nativeI16 = (value) => new Int16Array([value])[0];
globalThis.callbackF32 = (callback, value) => Math.fround(callback(Math.fround(value)));
globalThis.callbackI8 = (callback, value) => nativeI8(callback(nativeI8(value)));
globalThis.callbackU16 = (callback, value) => nativeU16(callback(nativeU16(value)));
globalThis.callbackI16 = (callback, value) => nativeI16(callback(nativeI16(value)));
globalThis.scalarMix = (a, b, c, d, e, f, g, h, i, j, k, l) => nativeI8(a) + nativeU16(b) + nativeI16(c) + Math.fround(d) + nativeI8(e) + nativeU16(f) + nativeI16(g) + Math.fround(h) + nativeI8(i) + nativeU16(j) + nativeI16(k) + Math.fround(l);
globalThis.nativeFill = (bytes, start) => {
  const first = new Uint8Array([start])[0];
  for (let i = 0; i < bytes.length; i++) bytes[i] = first + i;
};
globalThis.widthsStart = (callback) => setImmediate(() => callback(Math.fround(0.1), -128, 65535, -32768));
globalThis.widthsStop = () => {};
