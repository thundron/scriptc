interface Key { name: string; count: number }
const first: Key = { name: "same", count: 1 };
const second: Key = { name: "same", count: 1 };
const absent: Key = { name: "missing", count: 0 };
const numbers = new Map<Key, number>([[first, 1], [second, 2], [first, 3]]);
console.log(numbers.size, numbers.get(first), numbers.get(second), numbers.get(absent));
console.log(numbers.has(first), numbers.has(absent));
first.name = "changed";
first.count++;
console.log(numbers.get(first), numbers.size);
const alias = first;
numbers.set(alias, 9);
console.log(numbers.get(first), numbers.size);
for (const [key, value] of numbers) console.log(key.name, key.count, value, key === first);
console.log(numbers.delete(second), numbers.delete(second), numbers.size);
numbers.set(second, 10);
console.log([...numbers.keys()].map((key) => key.name).join(","));

const flags = new Map<Key, boolean>([[first, false], [second, true]]);
console.log(flags.get(first), flags.get(second), flags.get(absent));
flags.set(first, true);
console.log(flags.get(alias));

interface Value { text: string }
const original: Value = { text: "old" };
const replacement: Value = { text: "new" };
const records = new Map<Key, Value>([[first, original]]);
console.log(records.get(first) === original, records.get(absent));
records.set(first, replacement);
replacement.text = "updated";
console.log(records.get(first)?.text, original.text);
records.clear();
console.log(records.size, records.get(first));

const optional = new Map<Key, string | undefined>();
optional.set(first, undefined);
optional.set(second, "present");
console.log(optional.has(first), optional.get(first), optional.has(absent));
console.log([...optional.values()].map((value) => value ?? "none").join(","));

const a = [1, 2];
const b = [1, 2];
const arrays = new Map<number[], string>([[a, "a"], [b, "b"]]);
a.push(3);
console.log(arrays.get(a), arrays.get(b), arrays.get([1, 2]));
console.log([...arrays.keys()][0] === a);

class Base {
  name: string;
  constructor(name: string) { this.name = name; }
}
class Derived extends Base {
  extra: number;
  constructor(name: string, extra: number) { super(name); this.extra = extra; }
}
const child = new Derived("child", 4);
const base: Base = child;
const classes = new Map<Base, string>();
classes.set(child, "instance");
console.log(classes.get(base), classes.get(child), classes.has(new Base("child")));
console.log([...classes.keys()][0] === child);

const token = Symbol("key");
const other = Symbol("key");
const symbols = new Map<symbol, number>([[token, 1]]);
console.log(symbols.get(token), symbols.has(other));
symbols.set(other, 2);
console.log([...symbols.keys()][0] === token, symbols.size);

function readonlyLookup(map: ReadonlyMap<Key, number>, key: Key): number {
  return map.get(key) ?? -1;
}
console.log(readonlyLookup(numbers, first), readonlyLookup(numbers, absent));
