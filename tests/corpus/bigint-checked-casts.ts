import assert from "node:assert/strict";
function opaque(value: unknown): unknown { return value; }
const value = opaque({ pointer: 18446744073709551615n, nested: [-1n, 0n] });
const typed = value as { pointer: bigint; nested: bigint[] };
console.log(typed.pointer.toString(16), typed.nested[0] === -1n);
const maybe = opaque(0n) as bigint | undefined;
console.log(maybe === 0n);
const boxed = opaque(18446744073709551615n);
if (typeof boxed === "bigint") console.log(boxed + 1n);
assert.strictEqual(boxed, opaque(18446744073709551615n));
assert.deepStrictEqual(value, opaque({ pointer: 18446744073709551615n, nested: [-1n, 0n] }));
try { console.log((opaque(1) as bigint) + 1n); }
catch (error) { if (error instanceof Error) console.log(error.name); }
console.log("checked");

console.log((18446744073709551615n as unknown) === 18446744073709551615n);
