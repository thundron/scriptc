import * as f32 from "@scriptc/experimental/f32";
import { add as plus, mul as product } from "@scriptc/experimental/f32";

const values = [0, -0, 1, -1, 0.1, 1 + 2 ** -24, 2 ** -149, 3.4028234663852886e38, Infinity, -Infinity, NaN];
for (const a of values) {
  console.log("unary", f32.round(a), f32.neg(a), f32.abs(a), f32.sqrt(a));
  for (const b of values) {
    console.log("binary", f32.add(a, b), f32.sub(a, b), f32.mul(a, b), f32.div(a, b), f32.rem(a, b));
    console.log("minmax", f32.min(a, b), f32.max(a, b));
  }
}
console.log(Object.is(f32.add(-0, -0), -0), Object.is(f32.min(0, -0), -0), Object.is(f32.max(0, -0), 0));
console.log(plus(16777216, 1), product(0.1, 0.2));
// Ordinary arithmetic is deliberately not rounded to binary32.
console.log(16777216 + 1, 0.1 * 0.2);
let x = 0;
for (let i = 0; i < 100; i++) x = f32.add(f32.mul(x, 0.98), 0.01);
console.log(x);
