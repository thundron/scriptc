class Item {
  amount: number;
  constructor(amount: number) { this.amount = amount; }
}
function amount(value: Item | undefined): number { return value === undefined ? -1 : value.amount; }
function pair(left: Item | undefined, right: Item | undefined): string {
  return String(amount(left)) + ":" + String(amount(right));
}
const values = [new Item(3), new Item(5)];
function replace(): Item | undefined {
  values[0] = new Item(7);
  return values[0];
}
console.log(pair(values[0], replace()), amount(values[0]));
function clear(): Item | undefined {
  values.length = 0;
  return undefined;
}
console.log(pair(values[0], clear()), values.length);
values.push(new Item(11));
function mutatePayload(): Item | undefined {
  values[0]!.amount = 13;
  return values[0];
}
console.log(pair(values[0], mutatePayload()));
function clearInside(value: Item | undefined, source: Item[]): number {
  source.length = 0;
  return amount(value);
}
console.log(clearInside(values[0], values), values.length);
function mutateIndex(source: Item[]): number {
  source[0] = new Item(17);
  return 0;
}
values.push(new Item(19));
console.log(amount(values[mutateIndex(values)]), amount(values[0]));
let binding = [new Item(23)];
function replaceBinding(): number {
  binding = [new Item(29)];
  return 0;
}
console.log(amount(binding[replaceBinding()]), amount(binding[0]));
function nested(source: Item[]): string {
  const earlier = new Item(31);
  source.push(earlier);
  return pair(source[0], source.pop());
}
console.log(nested([new Item(37)]));
console.log(nested([]));
function triplet(a: Item | undefined, b: Item | undefined, c: Item | undefined): string {
  return pair(a, b) + ":" + String(amount(c));
}
const three = [new Item(41), new Item(43), new Item(47)];
function removeFirst(): Item | undefined { return three.shift(); }
console.log(triplet(three[0], removeFirst(), three[0]), three.length);
const records = [{ text: "first" }];
function text(value: { text: string } | undefined, unused: number): string {
  return value === undefined ? "missing" : value.text + String(unused);
}
function removeRecord(): number { records.length = 0; return 1; }
console.log(text(records[0], removeRecord()));
const words = ["kept"];
function word(value: string | undefined, unused: number): string {
  return value === undefined ? "missing" : value + String(unused);
}
function removeWord(): number { words.length = 0; return 2; }
console.log(word(words[0], removeWord()));
