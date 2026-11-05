// Unknown slots keep heterogeneous values in native collections.
const map = new Map<unknown, unknown>();
map.set(1, "number");
map.set("1", "string");
map.set(true, "boolean");
map.set(null, "null");
map.set(undefined, undefined);
map.set(NaN, "nan");
map.set(Number("no"), "nan replaced");
map.set(-0, "zero");
console.log(map.size, map.get(1), map.get("1"), map.get(true), map.get(null));
console.log(map.has(undefined), map.get(undefined), map.has("missing"), map.get("missing"));
console.log(map.get(NaN), map.get(0), map.get(-0));
for (const key of map.keys()) {
  if (typeof key === "number") console.log("numeric", key, Object.is(key, -0));
}

const point = { x: 1 };
const values = [1, 2];
map.set(point, values);
console.log(map.has(point), map.has({ x: 1 }), map.get(point) === values);
const stored = map.get(point) as number[];
stored.push(3);
console.log(values.length, stored === values);
point.x = 4;
console.log(map.get(point) === values);

class Item { value = 1; }
class Derived extends Item { extra = 2; }
const item = new Derived();
const base: Item = item;
map.set(base, item);
console.log(map.has(item), map.get(base) === item);
const fn = () => 42;
map.set(fn, fn);
console.log(map.has(fn), map.get(fn) === fn);
const seeded = new Map<unknown, unknown>([[point, values], ["record", point]]);
console.log(seeded.get(point) === values, seeded.get("record") === point);
function choose(flag: boolean): typeof point | string { return flag ? point : "unused"; }
const either = choose(true);
map.set(either, "union identity");
console.log(map.get(point));
const bytes = new Uint8Array([4, 5]);
map.set(bytes, bytes);
console.log(map.has(bytes), map.get(bytes) === bytes);
const siblingView = bytes.subarray(0);
map.set(siblingView, "view");
console.log(map.get(bytes) === bytes, map.get(siblingView), siblingView === bytes);
const copy = map.get(bytes) as Uint8Array;
copy[0] = 9;
console.log(bytes[0]);
const seededReferences = new Set<unknown>([point, values, bytes, item, fn]);
console.log(seededReferences.size, seededReferences.has(point), seededReferences.has(values), seededReferences.has(bytes));
console.log(seededReferences.has(item), seededReferences.has(fn));
seededReferences.clear();
const promise: Promise<unknown> = Promise.resolve<unknown>(3);
map.set(promise, promise);
console.log(map.has(promise), await map.get(promise));

const set = new Set<unknown>([-0, 0, NaN, NaN, false, undefined, null, "value"]);
set.add(point);
set.add(point);
console.log(set.size, set.has(point), set.has({ x: 4 }), set.has(false), set.has(NaN));
console.log(set.delete(undefined), set.delete(undefined), set.size);
set.clear();
console.log(set.size);
map.clear();
console.log(map.size);

const order = new Map<unknown, unknown>();
order.set("a", 1);
order.set("b", 2);
order.forEach((value, key) => {
  console.log("visit", key, value);
  if (key === "a") {
    order.delete("b");
    order.set("c", 3);
    order.set("a", 4);
  }
});
const keys = [...order.keys()];
console.log(keys.length, keys.includes("a"), keys.indexOf("c"), keys.includes("b"));
const copiedValues = [...order.values()];
console.log(copiedValues.includes(4), copiedValues.indexOf(3));
order.set(NaN, NaN);
const nanKeys = [...order.keys()];
console.log(nanKeys.includes(NaN), nanKeys.indexOf(NaN));
for (const [key, value] of order) console.log("entry", key, value);
order.clear();
seeded.clear();

// Repeated replacements release boxed keys and values in the RC audit lane.
for (let i = 0; i < 200; i++) {
  const key = { index: i };
  map.set(key, [i]);
  map.set(key, [i + 1]);
  map.delete(key);
  set.add(key);
  set.delete(key);
}
console.log(map.size, set.size);
