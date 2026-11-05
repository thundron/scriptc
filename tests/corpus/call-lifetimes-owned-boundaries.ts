class Item {
  value: number;
  constructor(value: number) { this.value = value; }
}
function inspect(item: Item): number { return item.value; }
function invoke(callback: (item: Item) => number, item: Item): number { return callback(item); }
function throughValue(items: Item[]): number {
  const item = items[0];
  return invoke(inspect, item);
}
console.log(throughValue([new Item(7)]));

function choose(flag: boolean): (item: Item) => number {
  return flag ? inspect : doubled;
}
function doubled(item: Item): number { return item.value * 2; }
console.log(choose(true)(new Item(11)), choose(false)(new Item(13)));

let saved: Item | undefined;
function store(item: Item): number { saved = item; return inspect(item); }
function mixed(inspected: Item, escaped: Item): number { saved = escaped; return inspected.value + escaped.value; }
function saveFromArray(items: Item[]): number {
  const first = items[0];
  const second = items[1];
  return mixed(first, second);
}
console.log(saveFromArray([new Item(17), new Item(19)]), saved?.value);
console.log(store(new Item(23)), saved?.value);

function identity(item: Item): Item { return item; }
function keep(items: Item[]): Item {
  const item = items[0];
  return identity(item);
}
const original = new Item(29);
const kept = keep([original]);
console.log(kept === original, inspect(kept));

function makeReader(items: Item[]): () => number {
  const item = items[0];
  items.length = 0;
  return () => inspect(item);
}
const reader = makeReader([new Item(31)]);
console.log(reader(), reader());

function rewritten(item: Item): number {
  const before = inspect(item);
  item = new Item(37);
  return before + inspect(item);
}
console.log(rewritten(new Item(41)));

class Reader {
  read(item: Item): number { return item.value; }
}
class ExtraReader extends Reader {
  read(item: Item): number { return item.value + 1; }
}
function dispatch(reader: Reader, items: Item[]): number {
  const item = items[0];
  return reader.read(item);
}
console.log(dispatch(new Reader(), [new Item(43)]), dispatch(new ExtraReader(), [new Item(47)]));

async function later(item: Item): Promise<number> {
  await Promise.resolve(0);
  return inspect(item);
}
async function retainedAcrossSuspend(): Promise<void> {
  const items = [new Item(53)];
  const item = items[0];
  const result = later(item);
  items.length = 0;
  console.log(await result);
}
await retainedAcrossSuspend();

function* suspended(item: Item): Generator<number, number, number> {
  yield inspect(item);
  return inspect(item) + 1;
}
const iterator = suspended(new Item(59));
console.log(iterator.next(0).value, iterator.next(0).value);
