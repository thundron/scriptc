class Item {
  label: string;
  constructor(label: string) { this.label = label; }
}
function read(value: Item | undefined): string { return value === undefined ? "missing" : value.label; }
function pair(left: Item | undefined, right: Item | undefined): string { return read(left) + ":" + read(right); }
function fail(): Item | undefined { throw new Error("later argument"); }
function failIndex(): number { throw new Error("index"); }
const values = [new Item("first"), new Item("second")];
try { console.log(pair(values[0], fail())); }
catch (error) { if (error instanceof Error) console.log(error.message); }
try { console.log(pair(values[4], fail())); }
catch (error) { if (error instanceof Error) console.log(error.message); }
try { console.log(pair(values[0], values[failIndex()])); }
catch (error) { if (error instanceof Error) console.log(error.message); }
function throwsInside(value: Item | undefined): string {
  console.log(read(value));
  throw new Error("inside");
}
try { console.log(throwsInside(values[0])); }
catch (error) { if (error instanceof Error) console.log(error.message); }
function returnThroughFinally(items: Item[]): string {
  try { return read(items[0]); }
  finally { items.length = 0; }
}
console.log(returnThroughFinally([new Item("returned")]));
function recover(items: Item[]): string {
  try { return pair(items[0], fail()); }
  catch { return read(items[0]); }
  finally { items.length = 0; }
}
console.log(recover([new Item("recovered")]));
function loop(items: Item[]): string {
  let result = "";
  for (let index = 0; index < 4; index++) {
    try {
      if (index === 1) continue;
      result += read(items[index]);
      if (index === 2) break;
    } finally {
      console.log("step", index);
    }
  }
  return result;
}
console.log(loop(values));
function store(value: Item | undefined, target: (Item | undefined)[]): void { target.push(value); }
const stored: (Item | undefined)[] = [];
store(values[0], stored);
store(values[7], stored);
values.length = 0;
console.log(read(stored[0]), read(stored[1]));
const callback: (value: Item | undefined) => string = read;
console.log(callback(stored[0]), callback(stored[2]));
class Reader {
  read(value: Item | undefined): string { return read(value); }
}
class Child extends Reader {
  read(value: Item | undefined): string { return "child:" + read(value); }
}
const reader: Reader = new Child();
console.log(reader.read(stored[0]), reader.read(stored[3]));
async function later(items: Item[]): Promise<string> {
  const result = read(items[0]);
  await Promise.resolve();
  return result;
}
console.log(await later([new Item("async")]));
function* iter(items: Item[]): Generator<string, string, unknown> {
  yield read(items[0]);
  return read(items[1]);
}
const iterator = iter([new Item("yielded")]);
console.log(iterator.next().value, iterator.next().value);
