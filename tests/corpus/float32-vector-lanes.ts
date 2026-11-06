import { add4, sub4, mul4, div4, min4, max4 } from "@scriptc/experimental/f32";
const a = new Float32Array([1, 2, -0, Infinity, NaN, -3, 7, 9]);
const b = new Float32Array([0.1, -4, 0, -Infinity, 2, -0, 8, 6]);
const out = new Float32Array(8);
add4(out, 1, a, 0, b, 0); console.log(JSON.stringify(out));
sub4(out, 0, a, 1, b, 1); console.log(JSON.stringify(out));
mul4(out, 0, a, 0, b, 0); console.log(JSON.stringify(out));
div4(out, 0, a, 0, b, 0); console.log(JSON.stringify(out));
min4(out, 0, a, 1, b, 1); console.log(JSON.stringify(out), Object.is(out[1], -0));
max4(out, 0, a, 1, b, 1); console.log(JSON.stringify(out), Object.is(out[1], 0));
add4(a, 1, a, 0, a, 2); console.log(JSON.stringify(a));
const short = new Float32Array([4, 5]);
add4(out, 0, short, 0, b, 0); console.log(JSON.stringify(out));
add4(out, -1, b, -1, b, 0); console.log(JSON.stringify(out));
add4(out, 0.5, a, 0, b, 0); console.log(JSON.stringify(out));
add4(out, 0, a, NaN, b, 0); console.log(JSON.stringify(out));
add4(out, 0, a, Infinity, b, 0); console.log(JSON.stringify(out));
const base = new Float32Array([1,2,3,4,5,6,7,8]);
add4(base.subarray(1), 0, base.subarray(0), 0, base.subarray(2), 0);
console.log(JSON.stringify(base));
let changing = new Float32Array([1, 2, 3, 4]);
function replaceInput(): number {
  changing = new Float32Array([10, 20, 30, 40]);
  return 0;
}
add4(out, 0, changing, replaceInput(), changing, 0);
console.log(JSON.stringify(out));
try {
  add4(out, 0, changing, (() => { throw new Error('index'); })(), changing, 0);
} catch (error) { console.log(error instanceof Error, JSON.stringify(out)); }
