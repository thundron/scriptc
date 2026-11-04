import { isDeepStrictEqual as equal } from "node:util";
import * as util from "util";

console.log("primitives", equal(NaN, NaN), equal(0, -0), equal(1, "1"), equal(undefined, null), equal(4n, 4n));
console.log("records", equal({ a: 1, b: [2, 3] }, { b: [2, 3], a: 1 }), equal({ a: 1 }, { a: 1, b: undefined }));
const left = { name: "nested", values: [1, 2, 3] };
const right = { name: "nested", values: [1, 2, 3] };
console.log("stored", equal(left, right), equal(left, { name: "other", values: [1, 2, 3] }));
const key = Symbol.for("deep-key");
console.log("symbols", equal(key, Symbol.for("deep-key")), equal(Symbol("key"), Symbol("key")));
const fn = (x: number): number => x + 1;
const other = (x: number): number => x + 1;
console.log("functions", equal(fn, fn), equal(fn, other), equal({ fn }, { fn: other }));
console.log("bytes", equal(Buffer.from([1, 2]), new Uint8Array([1, 2])), equal(Buffer.from([1, 2]), new Uint8Array([1, 2]), true));
console.log("brands", equal(new Uint16Array([1, 2]), new Uint16Array([1, 2])), equal(new Uint16Array([1, 2]), new Int16Array([1, 2]), true));
console.log("nested bytes", equal({ data: Buffer.from([1]) }, { data: new Uint8Array([1]) }), equal({ data: Buffer.from([1]) }, { data: new Uint8Array([1]) }, true));
const compare = util.isDeepStrictEqual;
const comparisons = [compare];
console.log("callable", comparisons[0]!(left, right), compare({ a: 1 }, { a: 2 }, false));
function apply(cmp: (a: unknown, b: unknown, skip?: boolean) => boolean): boolean { return cmp(left, right, true); }
console.log("callback", apply(compare));
interface Recursive { value: number; self?: Recursive }
const cycleA: Recursive = { value: 1 };
const cycleB: Recursive = { value: 1 };
cycleA.self = cycleA;
cycleB.self = cycleB;
console.log("typed cycles", equal(cycleA, cycleB));
cycleB.value = 2;
console.log("typed cycle mismatch", equal(cycleA, cycleB));
