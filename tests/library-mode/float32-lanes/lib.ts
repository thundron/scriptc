import { add4, mul4, min4, max4 } from "@scriptc/experimental/f32";
const a = new Float32Array(32);
const b = new Float32Array(32);
const output = new Float32Array(32);
export function run(scale: number): number {
  for (let i = 0; i < 32; i++) {
    a[i] = (i - 13) * scale;
    b[i] = 0.1 + i / 7;
  }
  for (let i = 0; i < 32; i += 4) {
    mul4(output, i, a, i, b, i);
    add4(output, i, output, i, b, i);
  }
  return output[0] + output[11] + output[31];
}
export function element(index: number): number { return output[index]; }
export function overlap(): number {
  for (let i = 0; i < 32; i++) a[i] = i + 1;
  add4(a, 1, a, 0, a, 2);
  return a[0] + a[1] * 2 + a[2] * 4 + a[3] * 8 + a[4] * 16;
}
export function signedZero(): number {
  a[0] = 0; a[1] = -0; b[0] = -0; b[1] = 0;
  min4(output, 0, a, 0, b, 0);
  const minimum = Object.is(output[0], -0) && Object.is(output[1], -0);
  max4(output, 0, a, 0, b, 0);
  return minimum && Object.is(output[0], 0) && Object.is(output[1], 0) ? 1 : 0;
}
