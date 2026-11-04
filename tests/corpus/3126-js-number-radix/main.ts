import { format, missing } from "./format.js";

console.log(format(new Uint8Array([0, 1, 15, 16, 128, 255]), 16));
console.log(format(new Uint8Array([2, 8, 32]), 2));
console.log(format(new Float64Array([0.5, -42, Infinity, NaN]), 16));
try {
  format(new Uint8Array([1]), 1);
} catch (error) {
  console.log(error instanceof RangeError, (error as Error).message);
}
console.log(missing(new Uint8Array([1])));
