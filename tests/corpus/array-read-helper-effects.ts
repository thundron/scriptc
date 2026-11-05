class Item {
  value: number;
  constructor(value: number) { this.value = value; }
}

function adjust(value: number): number { return Math.abs(value) + 2; }
function nested(value: number): number { return adjust(value) * 3; }
function even(value: number): number { return value <= 0 ? 1 : odd(value - 1); }
function odd(value: number): number { return value <= 0 ? 0 : even(value - 1); }

function read(items: Item[], index: number): number {
  const item = items[index];
  const result = nested(item.value);
  item.value += even(result);
  return result + item.value;
}

const shared = new Item(-3);
const items = [shared, shared, new Item(5)];
console.log(read(items, 0), read(items, 1), read(items, 2), shared.value);
items[-1] = new Item(7);
items[0.5] = new Item(11);
items[4_000_000_000] = new Item(13);
console.log(read(items, -1), read(items, 0.5), read(items, 4_000_000_000));
try { console.log(read(items, 17)); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message); }

function trim(items: Item[]): number { items.length = 0; return 4; }
function indirectTrim(items: Item[]): number { return trim(items); }
function liveAfterTrim(items: Item[]): number {
  const item = items[0];
  const result = indirectTrim(items);
  item.value += result;
  return item.value;
}
console.log(liveAfterTrim([new Item(19)]));

function recursiveTrim(items: Item[], count: number): number {
  if (count === 0) return trim(items);
  return recursiveTrim(items, count - 1);
}
function liveAfterRecursion(items: Item[]): number {
  const item = items[0];
  return recursiveTrim(items, 3) + item.value;
}
console.log(liveAfterRecursion([new Item(23)]));

function invoke(callback: () => number): number { return callback(); }
function liveAfterCallback(items: Item[]): number {
  const item = items[0];
  const result = invoke(() => trim(items));
  return item.value + result;
}
console.log(liveAfterCallback([new Item(29)]));

function ordered(items: Item[]): number {
  const item = items[0];
  const result = nested(trim(items));
  return item.value + result;
}
console.log(ordered([new Item(31)]));

function readMissing(items: Item[]): number {
  const item = items[1];
  return nested(item.value);
}
function unwind(items: Item[]): number {
  const item = items[0];
  return readMissing(items) + item.value;
}
try { console.log(unwind([new Item(37)])); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message); }

let stored = new Item(0);
function replace(items: Item[]): number {
  stored = items[0];
  items[0] = new Item(41);
  return 5;
}
function escaped(items: Item[]): number {
  const item = items[0];
  const result = replace(items);
  return item.value + result + items[0].value;
}
console.log(escaped([new Item(43)]), stored.value);

class Holder {
  item: Item;
  constructor(item: Item) { this.item = item; }
}
function setChild(holder: Holder): number { holder.item = new Item(47); return 2; }
function nestedOwner(holders: Holder[]): number {
  const holder = holders[0];
  const item = holder.item;
  return setChild(holder) + item.value + holder.item.value;
}
console.log(nestedOwner([new Holder(new Item(53))]));
