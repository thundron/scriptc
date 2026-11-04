function opaque(value: unknown): unknown { return value; }
const original = new RegExp("hello", "i");
const boxed = opaque(original);
const restored = boxed as RegExp;
console.log(restored === original, restored.source, restored.flags, restored.test("HELLO"));
console.log(boxed instanceof RegExp, opaque({}) instanceof RegExp);
const record = opaque({ pattern: original }) as { pattern: RegExp };
const list = opaque([original]) as RegExp[];
console.log(record.pattern === original, list[0] === original);
try { const bad = opaque("hello") as RegExp; console.log(bad.test("hello")); } catch (error) { if (error instanceof Error) console.log(error.name); }
