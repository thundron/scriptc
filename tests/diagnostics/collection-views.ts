interface WordSet extends ReadonlySet<string> {
  has(value: string): value is "word";
}

// An assertion cannot turn a structural mock into a native collection.
const mock = { has(value: string): boolean { return value === "word"; }, size: 1 };
const fake: WordSet = mock as unknown as WordSet;
console.log(fake.has("word"));
console.log((mock as unknown as WordSet).has("word"));
console.log((mock as unknown as WordSet).size);
console.log((new Set<number>([1]) as unknown as WordSet).has("word"));

interface WordMap extends ReadonlyMap<string, number> {
  has(value: string): value is "word";
}
console.log((new Map<number, number>([[1, 2]]) as unknown as WordMap).has("word"));

// Runtime additions and alternative method signatures are not erased.
interface TaggedSet extends ReadonlySet<string> { readonly label: string }
const tagged = new Set<string>() as unknown as TaggedSet;
console.log(tagged.label);

interface OverloadedSet extends ReadonlySet<string> {
  has(value: string): boolean;
  has(value: number): boolean;
}
const overloaded = new Set<string>() as unknown as OverloadedSet;
console.log(overloaded.has(1));
