export {};

const a = { name: "a" };
const b = { name: "b" };
const original = new Set([a, b]);
const copy = new Set(original);
console.log(copy !== original, copy.has(a), copy.has(b), copy.size);
original.delete(a);
copy.add(a);
console.log(original.has(a), copy.has(a));
for (const value of copy) console.log(value.name);

const strings = new Set(["a", "b", "c"]);
strings.delete("b");
strings.add("b");
console.log([...new Set(strings)].join(","));

let calls = 0;
function source(): Set<string> { calls++; return strings; }
const evaluated = new Set(source());
console.log(evaluated.size, calls);
strings.clear();
console.log(evaluated.size, strings.size);

function fresh<T extends Iterable<string>>(values: T): Set<string> {
  return new Set(values);
}
console.log([...fresh(["one", "two", "one"])].join(","));
console.log([...fresh(new Set(["three", "four"]))].join(","));

function cache(value: Set<string> | undefined): Set<string> { return value ?? new Set(); }
const cached = new Set(["cached"]);
console.log(cache(cached) === cached, cache(undefined).size);
let lazy: Set<string> | undefined;
lazy ??= new Set();
lazy.add("lazy");
console.log(lazy.has("lazy"));

// Map entries copy their containers while sharing stored Set identities.
const nested = new Map([["values", cached]]);
const copied = new Map(nested);
copied.get("values")!.add("shared");
console.log(nested.get("values") === cached, cached.has("shared"));
console.log([...copied][0]![1] === cached);
