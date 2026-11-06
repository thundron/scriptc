function show(value: number): string {
  return Object.is(value, -0) ? '-0' : String(value);
}
function pair(a: Float32Array, i: number, j: number): void {
  const x = a[i]!, y = a[j]!;
  const stored = new Float32Array(3);
  stored[0] = x + y;
  stored[1] = x - y;
  stored[2] = x * y;
  console.log(show(Math.fround(x + y)), show(Math.fround(x - y)), show(Math.fround(x * y)), show(Math.min(x, y)), show(Math.max(x, y)), show(stored[0]!), show(stored[1]!), show(stored[2]!));
}
const values = new Float32Array([0, -0, 1, -1, 16777216, 16777218, 1.0000001192092896, 2 ** -149, -(2 ** -149), 2 ** -126, 3.4028234663852886e38, -3.4028234663852886e38, Infinity, -Infinity, NaN]);
for (let i = 0; i <= values.length; i++) for (let j = 0; j <= values.length; j++) pair(values, i, j);
function wide(a: Float32Array, b: Float32Array): number { return a[0]! + b[0]!; }
function mixed(a: Float32Array, x: number): number { return Math.min(a[0]!, x); }
function changed(a: Float32Array, x: number): number { let y = a[0]!; y = x; return Math.min(y, a[1]!); }
console.log(wide(new Float32Array([16777216]), new Float32Array([1])));
const out = new Float32Array(1);
function assigned(a: Float32Array, b: Float32Array): number { return out[0] = a[0]! + b[0]!; }
console.log(assigned(new Float32Array([16777216]), new Float32Array([1])), out[0]);
console.log(mixed(new Float32Array([2]), 1 + 2 ** -25));
console.log(changed(new Float32Array([2, 2]), 1 + 2 ** -25));
let trace = '';
function left(): number { trace += 'a'; return Math.fround(1 + 2 ** -23); }
function right(): number { trace += 'b'; return Math.fround(-1); }
console.log(show(Math.fround(left() + right())), trace);
