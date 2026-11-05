export function alias(value) { return value; }
export function same(a, b) { return a === b; }
export function metadata(value, buffer) {
  console.log(value.length, value.byteLength, value.byteOffset, value.buffer === buffer, value.buffer === value.buffer);
}
export function subarray(value, start, end) { return value.subarray(start, end); }
export function slice(value, start, end) { return value.slice(start, end); }
export function change(value, index, number) { value[index] = number; }
export function clone(value) { return structuredClone(value); }
export function describe(value) { console.log(Buffer.isBuffer(value), String(value)); }
export function coerceWrites(value) {
  let calls = 0;
  const number = { valueOf() { calls++; return 260; } };
  for (const key of ["0", "-0", "-1", "1.5", "99", "NaN", "Infinity"]) value[key] = number;
  console.log(calls, value[0], value[99], value["-0"]);
}
