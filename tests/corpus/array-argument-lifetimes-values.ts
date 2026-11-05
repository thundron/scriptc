class Item {
  amount: number;
  label: string;
  constructor(amount: number, label: string) { this.amount = amount; this.label = label; }
}
function amount(value: Item | undefined): number {
  return value === undefined ? -1 : value.amount;
}
function label(value: Item | undefined): string {
  return value === undefined ? "missing" : value.label;
}
function relay(value: Item | undefined): number { return amount(value); }
function read(values: Item[], index: number): number { return relay(values[index]); }
const values = [new Item(3, "three"), new Item(7, "seven")];
for (const index of [0, 1, 2, -1, 0.5, NaN, Infinity, -0]) {
  console.log(index, read(values, index), label(values[index]));
}
const sparse: Item[] = [];
sparse[4] = new Item(11, "eleven");
sparse[100000] = new Item(13, "large");
sparse[-1] = new Item(17, "negative");
sparse[0.5] = new Item(19, "fraction");
for (const index of [0, 3, 4, 5, 100000, -1, 0.5]) {
  console.log(index, read(sparse, index), label(sparse[index]));
}
function pair(left: Item | undefined, right: Item | undefined): string {
  return label(left) + ":" + label(right);
}
console.log(pair(values[0], values[1]));
console.log(pair(values[2], values[0]));
console.log(pair(values[0], values[2]));
console.log(pair(values[2], values[3]));
function same(left: Item | undefined, right: Item | undefined): boolean {
  return left !== undefined && right !== undefined && left.amount === right.amount;
}
console.log(same(values[0], values[0]), same(values[0], values[1]));
const saved = label(values[0]);
values.length = 0;
console.log(saved);
function stringLength(value: string | undefined): number { return value === undefined ? -1 : value.length; }
const words = ["first", "", "\u{1f642}"];
console.log(stringLength(words[0]), stringLength(words[1]), stringLength(words[2]), stringLength(words[3]));
function recordValue(value: { key: string; count: number } | undefined): string {
  return value === undefined ? "missing" : value.key + ":" + String(value.count);
}
const records = [{ key: "one", count: 1 }, { key: "two", count: 2 }];
console.log(recordValue(records[0]), recordValue(records[1]), recordValue(records[2]));
function arrayLength(value: number[] | undefined): number { return value === undefined ? -1 : value.length; }
const arrays = [[1, 2], []];
console.log(arrayLength(arrays[0]), arrayLength(arrays[1]), arrayLength(arrays[2]));
function create(): Item[] { return [new Item(23, "temporary")]; }
console.log(amount(create()[0]), label(create()[0]));
function sum(items: Item[]): number {
  let result = 0;
  for (let index = 0; index < items.length + 1; index++) result += amount(items[index]);
  return result;
}
console.log(sum([new Item(29, "a"), new Item(31, "b")]), sum([]));
