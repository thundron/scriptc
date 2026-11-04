declare function nativeF32(value: number): number;
declare function nativeI8(value: number): number;
declare function nativeU16(value: number): number;
declare function nativeI16(value: number): number;
declare function callbackF32(callback: (value: number) => number, value: number): number;
declare function callbackI8(callback: (value: number) => number, value: number): number;
declare function callbackU16(callback: (value: number) => number, value: number): number;
declare function callbackI16(callback: (value: number) => number, value: number): number;
declare function scalarMix(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number): number;
declare function nativeFill(value: Uint8Array, start: number): void;
declare function widthsStart(callback: (f: number, i8: number, u16: number, i16: number) => void): void;
declare function widthsStop(callback: (f: number, i8: number, u16: number, i16: number) => void): void;

const integers: number[] = [0, -0, 127, 128, 255, 256, -129, 32767, 32768, 65535, 65536, -32769, 4294967297, -4294967297, 1.9, -1.9, NaN, Infinity, -Infinity];
for (const value of integers) {
  console.log(nativeI8(value), nativeU16(value), nativeI16(value));
}
const floats: number[] = [0, -0, 0.1, 16777217, -16777217, 1e-45, 1e40, -1e40, NaN, Infinity, -Infinity];
for (const value of floats) {
  const output = nativeF32(value);
  console.log(output, 1 / output);
}
console.log(callbackF32((value) => { console.log("f32", value); return value + 0.1; }, 16777217));
console.log(callbackI8((value) => { console.log("i8", value); return 257; }, 255));
console.log(callbackU16((value) => { console.log("u16", value); return -2; }, -1));
console.log(callbackI16((value) => { console.log("i16", value); return 65535; }, 32768));
console.log(scalarMix(128, -1, 32768, 0.5, 255, -32768, 65535, -0.25, 129, -2, 32769, 1.5));
try {
  callbackF32(() => { throw new Error("float callback"); }, 1);
} catch (error) {
  if (error instanceof Error) console.log("caught", error.message);
  else throw error;
}

const backing = new Uint8Array([91, 1, 2, 3, 92]);
const view = backing.subarray(1, 4);
nativeFill(view, 255);
console.log(backing.join(","), view.join(","));
nativeFill(new Uint8Array(0), 1);
const buffer = Buffer.from([93, 4, 5, 94]);
nativeFill(buffer.subarray(1, 3), 42);
console.log(buffer.join(","));

let started = false;
const foreign = (f: number, i8: number, u16: number, i16: number): void => {
  console.log("foreign", started, f, i8, u16, i16);
  widthsStop(foreign);
};
widthsStart(foreign);
started = true;
