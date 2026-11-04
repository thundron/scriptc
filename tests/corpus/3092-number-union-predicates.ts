export {};

const values: (string | number | boolean | null | undefined)[] = [
  0, -0, 3.5, 42, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER + 1, "42", "NaN", true, false, null, undefined,
];
for (const value of values) {
  console.log(String(value), Number.isFinite(value), Number.isNaN(value),
    Number.isInteger(value), Number.isSafeInteger(value));
}
let evaluated = 0;
function next(): number | string { evaluated++; return evaluated === 1 ? "7" : 7; }
console.log("once", Number.isFinite(next()), evaluated, Number.isInteger(next()), evaluated);
const sparse: number[] = [, 2] as number[];
console.log("missing", Number.isFinite(sparse[0]), Number.isNaN(sparse[0]), Number.isInteger(sparse[0]));
