// Nested collections preserve reference identity through every Map value
// operation. The sanitizer lane also checks replacement/deletion ownership.
const first = new Map<string, number>([["a", 1], ["b", 2]]);
const second = new Map<string, number>([["c", 3]]);
const outer = new Map<string, Map<string, number>>([
  ["left", first], ["right", second], ["alias", first],
]);
console.log(outer.size, outer.get("missing") === undefined);
console.log(outer.get("left") === first, outer.get("alias") === first);
outer.get("alias")!.set("a", 9);
console.log(first.get("a"), outer.get("left")!.get("a"));

for (const [name, inner] of outer) console.log(name, inner.size, inner === first);
for (const inner of outer.values()) console.log(inner.get("a") ?? -1);
outer.forEach((inner, name) => {
  console.log(name, inner === outer.get(name));
});

// Replacing one reference does not invalidate another alias or a borrowed
// result kept live across the replacement and clearing of the outer map.
const retained = outer.get("left")!;
outer.set("left", second);
console.log(outer.get("left") === second, retained === first, retained.get("a"));
console.log(outer.delete("alias"), outer.delete("alias"), first.get("b"));
outer.clear();
console.log(outer.size, retained.get("b"), second.get("c"));

const sets = new Map<number, Set<string>>();
const names = new Set<string>(["one", "two"]);
sets.set(1, names);
sets.set(2, names);
console.log(sets.get(1) === names, sets.get(2) === names);
sets.get(1)!.add("three");
console.log(sets.get(2)!.has("three"), names.size);
for (const [id, set] of sets.entries()) console.log(id, [...set].join(","));
sets.set(1, new Set<string>(["replacement"]));
console.log(names.size, sets.get(1)!.size);
sets.clear();
console.log(names.has("two"));

// Each Map layer has its own scalar key domain and nullability contract.
const three = new Map<number, Map<string, Map<number, boolean>>>();
const booleans = new Map<number, boolean>([[0, false], [1, true]]);
three.set(7, new Map<string, Map<number, boolean>>([["flags", booleans]]));
console.log(three.get(7)!.get("flags") === booleans);
console.log(three.get(7)!.get("flags")!.get(0), three.get(7)!.get("flags")!.has(2));
three.get(7)!.get("flags")!.delete(1);
console.log(booleans.size);

const optional = new Map<string, Map<string, number> | undefined>();
optional.set("absent", undefined);
optional.set("present", first);
console.log(optional.has("absent"), optional.get("absent") === undefined);
console.log(optional.has("missing"), optional.get("missing") === undefined);
const present = optional.get("present");
if (present !== undefined) console.log(present === first, present.get("a"));
optional.clear();

function readOnly(input: ReadonlyMap<string, ReadonlyMap<string, number>>): number {
  let total = 0;
  for (const inner of input.values()) for (const value of inner.values()) total += value;
  return total;
}
const readonlyView: ReadonlyMap<string, ReadonlyMap<string, number>> = new Map<string, Map<string, number>>([["first", first]]);
console.log(readOnly(readonlyView));

// Identity keys are independent of the nested value's identity.
class Key { id: number; constructor(id: number) { this.id = id; } }
const key = new Key(1);
const sameShape = new Key(1);
const keyed = new Map<Key, Map<string, number>>([[key, first]]);
console.log(keyed.get(key) === first, keyed.has(sameShape));
keyed.set(sameShape, first);
console.log(keyed.size, keyed.get(sameShape) === keyed.get(key));

// Overwriting an identical reference must retain before releasing it.
for (let i = 0; i < 40; i++) keyed.set(key, keyed.get(key)!);
console.log(keyed.get(key)!.get("a"));

// Nested containers returned by callbacks escape the callback's scope.
function createInner(seed: number): Map<string, number> {
  return new Map<string, number>([["seed", seed]]);
}
const factories = [1, 2, 3].map((seed) => ({ name: `n${seed}`, inner: createInner(seed) }));
const results = new Map<string, Map<string, number>>();
for (const entry of factories) results.set(entry.name, entry.inner);
console.log(results.get("n2")!.get("seed"));
