export {};

function encode(_key: string, value: unknown): unknown {
  if (typeof value === "number") {
    if (Number.isNaN(value)) return { number: "nan" };
    if (!Number.isFinite(value)) return { number: value > 0 ? "inf" : "-inf" };
    if (Object.is(value, -0)) return { number: "-0" };
  }
  return value;
}
function decode(_key: string, value: unknown): unknown {
  if (typeof value === "object" && value !== null && "number" in value) {
    const tag = (value as { number: string }).number;
    if (tag === "nan") return NaN;
    if (tag === "inf") return Infinity;
    if (tag === "-inf") return -Infinity;
    if (tag === "-0") return -0;
  }
  return value;
}
const values = [0, -0, Infinity, -Infinity, NaN, 1.25, 1e300];
const encoded = JSON.stringify({ values }, encode, 2);
if (encoded === undefined) throw new Error("missing document");
console.log(encoded);
const decoded = JSON.parse(encoded, decode) as { values: number[] };
for (const value of decoded.values) console.log(String(value), Object.is(value, -0), Number.isNaN(value));
console.log(JSON.stringify(decoded, encode) === JSON.stringify({ values }, encode));
console.log(JSON.stringify([NaN, Infinity, -Infinity, -0], (_key: string, value: unknown) => value));
