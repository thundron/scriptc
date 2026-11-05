export {};

const source = new Map<string, number>([["a", 1], ["b", 2], ["c", 3]]);
source.delete("b");
source.set("d", 4);
source.set("a", 5);
console.log(JSON.stringify([...source]));
const copied = new Map(source);
console.log(copied !== source, JSON.stringify([...copied]));
source.set("a", 6);
copied.set("c", 7);
console.log(source.get("a"), copied.get("a"), source.get("c"), copied.get("c"));

let effects = "";
function getSource(): Map<string, number> { effects += "S"; return source; }
console.log(JSON.stringify([...getSource()]), effects);
effects = "";
console.log(new Map(getSource()).size, effects);

function fallback(): [string, number][] { effects += "F"; return [["fallback", 8]]; }
function optional(value: Map<string, number> | undefined): Map<string, number> {
  return new Map(value ?? fallback());
}
effects = "";
console.log(JSON.stringify([...optional(source)]), effects);
console.log(JSON.stringify([...optional(undefined)]), effects);

function emptyDefault(value: Map<string, number> | undefined): Map<string, number> {
  return new Map(value ?? []);
}
console.log(emptyDefault(source).size, emptyDefault(undefined).size);

function nullable(value: Map<string, number> | null | undefined): Map<string, number> {
  return new Map(value);
}
console.log(nullable(source).size, nullable(null).size, nullable(undefined).size);
console.log(new Map<string, number>(null).size, new Map<string, number>(undefined).size);

function branch(takeMap: boolean): Map<string, number> {
  return new Map(takeMap ? source : [["branch", 9]]);
}
console.log(JSON.stringify([...branch(true)]), JSON.stringify([...branch(false)]));

const key = { id: "identity" };
const value = { count: 10 };
const objects = new Map([[key, value]]);
const clonedObjects = new Map(objects);
const pairs = [...objects];
const secondPairs = [...objects];
console.log(clonedObjects.has(key), clonedObjects.get(key) === value);
console.log(pairs[0] === secondPairs[0], pairs[0]![0] === key, pairs[0]![1] === value);
value.count = 11;
console.log(clonedObjects.get(key)!.count, pairs[0]![1].count);
pairs[0]![1] = { count: 12 };
console.log(objects.get(key)!.count, pairs[0]![1].count);

function generic<K extends string | number, V>(map: Map<K, V>): Map<K, V> {
  const copy = new Map(map);
  const entries = [...copy];
  return new Map(entries);
}
console.log(JSON.stringify([...generic(new Map([[1, "one"]]))]));
console.log(JSON.stringify([...generic(new Map([["two", 2]]))]));

// A fallback can reassign the binding whose missing value selected it.
// The constructor must consume the evaluated fallback, not reread that binding.
let current: Map<string, number> | undefined;
function populate(): [string, number][] {
  current = new Map([["other", 13]]);
  return [["selected", 14]];
}
const selected = new Map(current ?? populate());
console.log(JSON.stringify([...selected]), current!.get("other"));

// A spread must preserve a missing Map and throw; a constructor accepts
// the same value as empty. Keep both arms in the test's declared storage.
const maps = new Map<number, Map<string, number>>([[0, source]]);
function missingIndex(): number { return 9; }
const missing = maps.get(missingIndex());
function spreadOptional(missing: Map<string, number> | undefined): void {
  try {
    // @ts-expect-error Exercise the runtime's non-iterable boundary.
    const entries: [string, number][] = [...missing];
    console.log(entries);
  } catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
}
spreadOptional(missing);
console.log(new Map(missing).size);

const rebuilt = new Map([...source, ["a", 15], ["last", 16]]);
console.log(JSON.stringify([...rebuilt]));

function cache(value: Map<string, number> | undefined): Map<string, number> {
  return value ?? new Map();
}
console.log(cache(source) === source, cache(undefined).size);
let lazy: Map<string, number> | undefined;
lazy ??= new Map();
lazy.set("lazy", 17);
console.log(lazy.get("lazy"));
console.log(new Map(source ?? new Map()).size);
