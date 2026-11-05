const key = { id: 1 };
const value = { count: 2 };
const records = new Map<typeof key, typeof value>([[key, value]]);
const keys = new Set(records.keys());
const values = new Set(records.values());
console.log("record identity", keys.has(key), values.has(value));
for (const item of values) item.count++;
console.log("record mutation", value.count);

const array = [1, 2];
const arrays = new Set<number[]>([array]);
const arrayCopy = new Set(arrays.values());
console.log("array identity", arrayCopy.has(array));
for (const item of arrayCopy) item.push(3);
console.log("array mutation", array.join(","));

class Box {
  count: number;
  constructor(count: number) { this.count = count; }
}
const box = new Box(4);
const boxes = new Map<string, Box>([["first", box], ["second", box]]);
const copiedBoxes = new Set(boxes.values());
console.log("class identity", copiedBoxes.size, copiedBoxes.has(box));
for (const item of copiedBoxes) item.count++;
console.log("class mutation", box.count);

const inner = new Map<string, number>([["x", 7]]);
const holder = { inner };
const outer = new Set<typeof holder>([holder]);
const nested = new Set(outer.keys());
console.log("nested identity", nested.has(holder));
for (const item of nested) item.inner.set("y", 8);
console.log("nested mutation", inner.get("y"));

const mixed = new Set<number[] | typeof key>([array, key]);
const mixedCopy = new Set(mixed.values());
console.log("union identity", mixedCopy.has(array), mixedCopy.has(key));

const wider = { id: 2, label: "wide" };
const overlapping = new Set<typeof key | typeof wider>([key, wider]);
const overlapCopy = new Set(overlapping.values());
console.log("overlapping identity", overlapCopy.size, overlapCopy.has(key), overlapCopy.has(wider));

// Each entries() result is a fresh pair retaining its original members.
const entries = new Set(records.entries());
console.log("entry count", entries.size);
for (const [k, v] of entries) console.log("entry identity", k === key, v === value);
const pairs = new Set(arrays.entries());
for (const [a, b] of pairs) console.log("set pair identity", a === array, a === b);

records.clear();
arrays.clear();
boxes.clear();
outer.clear();
console.log("retained", keys.has(key), values.has(value), arrayCopy.has(array), copiedBoxes.has(box), nested.has(holder));
