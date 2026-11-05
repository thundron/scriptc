function store(input: number): void {
  let value = input;
  const u8 = new Uint8Array(3);
  const i8 = new Int8Array(3);
  const u16 = new Uint16Array(3);
  const i16 = new Int16Array(3);
  const u32 = new Uint32Array(3);
  const i32 = new Int32Array(3);
  const clamped = new Uint8ClampedArray(3);
  const floats = new Float64Array(3);
  for (let i = 0; i < 3; i++) {
    if (i > 0) value = Math.imul(value, 31) >>> 0;
    u8[i] = value; i8[i] = value; u16[i] = value; i16[i] = value;
    u32[i] = value; i32[i] = value; clamped[i] = value; floats[i] = value;
    console.log(u8[i], i8[i], u16[i], i16[i], u32[i], i32[i], clamped[i], floats[i], 1 / floats[i]);
    console.log((i8[i] ^ u8[i]) >>> 0, Math.imul(i16[i], u16[i]), ~i32[i], Math.clz32(u32[i]));
  }
}
for (const value of [-0, 0.5, 1.5, 2.5, -1.5, NaN, Infinity, -Infinity, 65535, 2147483648, 4294967295, 1e30]) store(value);

function aliases(): void {
  let target = new Uint32Array(4);
  const first = target;
  const second = new Uint32Array(1);
  let value = 1.5;
  target[0] = value ^ (value = 9);
  target[1] = (target = second).length + (value = 4294967295);
  target[-1] = value = 17.5;
  target[1.25] = value = -0;
  target[4] = value = 2.5;
  console.log(first[0], first[1], second[0], value, value >>> 0);
  const shared = first.subarray(1);
  shared[0] = Math.imul(first[0], 3);
  console.log(first[1], shared[0]);
}
aliases();
