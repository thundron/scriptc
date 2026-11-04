// Iterator results preserve original records, arrays, and class instances.
const key = { id: 1 };
const value = { count: 2 };
const records = new Map<typeof key, typeof value>([[key, value]]);
const entry = records.entries().next();
if (!entry.done) {
  console.log("record identity", entry.value[0] === key, entry.value[1] === value);
  entry.value[1].count += 10;
}
console.log("record mutation", value.count);
const recordKey = records.keys().next();
if (!recordKey.done) {
  console.log("key identity", recordKey.value === key);
  recordKey.value.id = 3;
}
console.log("key mutation", key.id);

const array = [1, 2];
const arrays = new Set<number[]>([array]);
const item = arrays.values().next();
if (!item.done) {
  console.log("array identity", item.value === array);
  item.value.push(3);
}
console.log("array mutation", array.join(","));
const pair = arrays.entries().next();
if (!pair.done) console.log("set pair identity", pair.value[0] === array, pair.value[0] === pair.value[1]);

class Box {
  count: number;
  constructor(count: number) { this.count = count; }
}
const box = new Box(4);
const boxes = new Map<string, Box>([["box", box]]);
const boxValue = boxes.values().next();
if (!boxValue.done) {
  console.log("class identity", boxValue.value === box);
  boxValue.value.count += 1;
}
console.log("class mutation", box.count);

const nested = new Map<string, Map<string, number>>([["inner", new Map([["x", 7]])]]);
const inner = nested.values().next();
if (!inner.done) console.log("nested identity", inner.value === nested.get("inner"), inner.value.get("x"));

const mixed = new Map<string, typeof value | string>([["record", value], ["text", "hello"]]);
const mixedCursor = mixed.values();
const mixedRecord = mixedCursor.next();
if (!mixedRecord.done && typeof mixedRecord.value !== "string") {
  console.log("union identity", mixedRecord.value === value);
  mixedRecord.value.count += 1;
}
console.log("union mutation", value.count, mixedCursor.next().value);
const mixedArrays = new Set<number[] | typeof key>([array, key]);
const mixedArray = mixedArrays.values().next();
if (!mixedArray.done) console.log("union array", mixedArray.value === array);
