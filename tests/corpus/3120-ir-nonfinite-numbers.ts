// These constants must also survive --emit=ir and a native emitter's input.
const numbers = [NaN, Number.NaN, Infinity, -Infinity, -0, 0, Number.MIN_VALUE, Number.MAX_VALUE];
for (const value of numbers) {
  console.log(String(value), Number.isNaN(value), Number.isFinite(value), Object.is(value, -0));
}
function equal(left: number, right: number): boolean { return left === right; }
console.log("nan", equal(NaN, NaN), Object.is(NaN, NaN), [NaN].includes(NaN));
const values = new Map<number, string>();
values.set(NaN, "first");
values.set(Number.NaN, "second");
values.set(-0, "zero");
console.log("map", values.size, values.get(NaN), values.get(0));
const bytes = new Float64Array([NaN, -0, Infinity, -Infinity]);
console.log("bytes", Number.isNaN(bytes[0]), Object.is(bytes[1], -0), bytes[2], bytes[3]);
console.log("json", JSON.stringify({ numbers, nan: NaN, negativeZero: -0 }));
