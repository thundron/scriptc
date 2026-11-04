import assert from "node:assert/strict";

function make(value: number) {
  return class Stored {
    constructor(extra: number = 0) { value += extra; }
    read(): number { return value; }
  };
}
const A = make(12);
const B = make(25);
const one: unknown = A;
const again: unknown = A;
const two: unknown = B;
console.log(typeof one, one === again, one === two);
assert.strictEqual(one, again);
assert.notStrictEqual(one, two);
assert.deepStrictEqual(one, again);
const properties = one as Record<string, unknown>;
console.log(properties.name, properties.length);
const Restored = one as typeof A;
console.log(new Restored(2).read(), new B().read());
const call = one as () => void;
try { call(); } catch (error) { console.log((error as Error).name, (error as Error).message); }
class Top { constructor(first: number, second = 0) {} }
const top: unknown = Top;
const topProperties = top as Record<string, unknown>;
console.log(topProperties.name, topProperties.length);
const Saved = top as typeof Top;
const saved = new Saved(1);
console.log(saved instanceof Top);
const list: unknown = [A, B];
console.log(JSON.stringify(list));
