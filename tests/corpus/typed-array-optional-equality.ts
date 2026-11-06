function equal(a: Float64Array, i: number, b: Float32Array, j: number): boolean {
  return a[i] === b[j];
}
function notEqual(a: Float64Array, i: number, b: Float32Array, j: number): boolean {
  return a[i] !== b[j];
}
function asserted(a: Float64Array, i: number, b: Float32Array, j: number): boolean {
  return a[i]! !== b[j]!;
}
const a = new Float64Array([NaN, 0, -0, Infinity, 4]);
const b = new Float32Array([NaN, -0, 0, Infinity]);
const indices = [-1, -0, 0, 1, 2, 3, 4, 5, 0.5, NaN, Infinity, 2 ** 40];
for (const i of indices) {
  for (const j of indices) console.log(equal(a, i, b, j), notEqual(a, i, b, j), asserted(a, i, b, j));
}
let left = new Float64Array([5]);
const right = new Float32Array([5]);
let trace = '';
function receiver(): Float64Array { trace += 'a'; return left; }
function index(): number { trace += 'i'; left = new Float64Array([99]); return 0; }
function other(): Float32Array { trace += 'b'; return right; }
console.log(receiver()[index()] === other()[0], trace, left[0]);
let first = new Float64Array([7]);
function mutate(): Float32Array { first[0] = 12; return new Float32Array([7]); }
console.log(first[0] !== mutate()[0], first[0]);
const ints = new Int16Array([0, 4]);
function integerEqual(i: number, j: number): boolean { return ints[i] === ints[j]; }
for (const i of indices) for (const j of indices) console.log(integerEqual(i, j));
