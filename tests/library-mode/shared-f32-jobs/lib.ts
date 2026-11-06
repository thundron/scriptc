import { shared, allocateShared, releaseShared, add, mul, add4 } from "@scriptc/experimental/f32";
let privateCounter = 0;
export function run(handle: number, begin: number, end: number, bias: number): number {
  const values = shared(handle);
  const lanes = new Float32Array([bias, bias, bias, bias]);
  let i = begin;
  for (; i + 4 <= end; i += 4) add4(values, i, values, i, lanes, 0);
  for (; i < end; i++) values[i] = add(values[i], bias);
  privateCounter++;
  return privateCounter;
}
export function sum(handle: number): number {
  const values = shared(handle);
  let total = 0;
  for (let i = 0; i < values.length; i++) total = add(total, values[i]);
  return total;
}
export function allocate(length: number): number { return allocateShared(length); }
export function release(handle: number): void { releaseShared(handle); }
export function valid(handle: number): number {
  try { return shared(handle).length; } catch { return -1; }
}
export function forever(): void { while (true) privateCounter = mul(privateCounter + 1, 1); }

export function echo(value: number): number { return value; }
export function text(value: string): string { return value + "λ\0😀"; }
export function cstring(value: string): string { return value + "✓"; }
export function bytes(value: Uint8Array): Uint8Array { return value.slice(); }
export function randomOkay(): number { const value = Math.random(); return value >= 0 && value < 1 ? 1 : 0; }

const privateBytes = new Uint32Array(1);
const privateArray = [0];
const privateObject = {count: 0};
function privateCallable(): number { privateCallable.count++; return privateCallable.count; }
privateCallable.count = 0;
export function state(): number {
  privateBytes[0]++; privateArray[0]++; privateObject.count++;
  return privateCallable() * 1000 + privateBytes[0] * 100 + privateArray[0] * 10 + privateObject.count;
}
