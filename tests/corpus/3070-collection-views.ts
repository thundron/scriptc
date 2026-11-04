// @transform-types
interface Values<T> extends ReadonlySet<T> {}
interface MoreValues<T> extends Values<T> {}
interface Words<K extends string> extends MoreValues<string> {
  has(value: string): value is K;
}

function words<const K extends readonly string[]>(values: K): Words<K[number]> {
  return new Set<string>(values) as unknown as Words<K[number]>;
}
const colors = words(["red", "blue", "red"] as const);
console.log(colors.has("red"), colors.has("green"), colors.size);
console.log([...colors].join(","));
colors.forEach((value, same) => console.log(value, value === same));

// Reusing a generic interface must not reuse a previous element layout.
const numbers: MoreValues<number> = new Set([3, 1, 3]);
const strings: MoreValues<string> = new Set(["one", "two"]);
console.log(numbers.has(3), numbers.has(4), [...numbers].join(","));
console.log(strings.has("one"), strings.has("three"));

interface Lookup<K, V> extends ReadonlyMap<K, V> {}
interface NamedLookup<V> extends Lookup<string, V> {}
interface RefinedLookup<K extends string, V> extends NamedLookup<V> {
  has(key: string): key is K;
}
const backing = new Map<string, number>([["first", 1]]);
const lookup = backing as unknown as RefinedLookup<"first" | "second", number>;
backing.set("second", 2);
console.log(lookup.has("second"), lookup.get("second"), lookup.size);
console.log([...lookup.keys()].join(","));
lookup.forEach((value, key) => console.log(key, value));

// Ordinary user interfaces with collection names remain records.
namespace Local {
  export interface ReadonlySet<T> { item: T }
  export interface SetView<T> extends ReadonlySet<T> {}
}
const ordinary: Local.SetView<string> = { item: "record" };
console.log(ordinary.item);
