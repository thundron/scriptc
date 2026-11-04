export {};

let effects = "";
const original = new Set(["a", "b", "c"]);
original.delete("b");
original.add("b");
function values(set: Set<string>): string { return [...set].join(","); }
function fallback(): string[] { effects += "F"; return ["fallback", "fallback"]; }
function source(value: Set<string> | null | undefined): Set<string> | null | undefined {
  effects += "S";
  return value;
}
function copy(value: Set<string> | null | undefined): Set<string> {
  return new Set(source(value) ?? fallback());
}
console.log(values(copy(original)), effects);
effects = "";
console.log(values(copy(undefined)), effects);
effects = "";
console.log(values(copy(null)), effects);
console.log(new Set<string>(null).size, new Set<string>(undefined).size);
function optional(value: Set<string> | null | undefined): Set<string> { return new Set(value); }
const copied = optional(original);
console.log(copied !== original, values(copied), optional(null).size, optional(undefined).size);
original.add("later");
copied.delete("a");
console.log(values(original), values(copied));

// This is the inherited metadata shape used by the compiler's classes.
interface Metadata { names?: Set<string> }
function inherited(base: Metadata | null): Set<string> { return new Set(base?.names ?? []); }
console.log(values(inherited({ names: original })), inherited({}).size, inherited(null).size);
function choose(useSet: boolean): Set<string> { return new Set(useSet ? original : ["other", "other"]); }
console.log(values(choose(true)), values(choose(false)));
function nested(first: boolean, second: boolean): Set<string> {
  return new Set(first ? (second ? original : null) : ["array"]);
}
console.log(values(nested(true, true)), nested(true, false).size, values(nested(false, true)));

// Evaluating the fallback may reassign the binding which selected it.
let current: Set<string> | undefined;
function populate(): string[] { current = new Set(["reassigned"]); return ["selected"]; }
const selected = new Set(current ?? populate());
console.log(values(selected), values(current!));
let calls = 0;
function empty(): undefined { calls++; return undefined; }
console.log(new Set<string>(empty()).size, calls);
console.log(values(new Set(empty() ?? ["after"])), calls);
console.log(new Set<string>(void calls++).size, calls);

function array(value: string[] | undefined): Set<string> { return new Set(value); }
console.log(values(array(["one", "one", "two"])), array(undefined).size);
function text(value: string | undefined): Set<string> { return new Set(value); }
console.log(values(text("😀a😀雪")), text(undefined).size, text("").size);
function tuple(value: readonly [string, string] | null): Set<string> { return new Set(value); }
console.log(values(tuple(["x", "y"])), tuple(null).size);

// Identity and insertion order survive optional copies and later mutation.
interface Key { value: number }
const a: Key = { value: 1 };
const b: Key = { value: 2 };
const keys = new Set([a, b]);
function keyCopy(value: Set<Key> | undefined): Set<Key> { return new Set(value ?? []); }
const keyClone = keyCopy(keys);
keys.delete(a);
console.log(keyClone.has(a), keys.has(a), keyClone.has({ value: 1 }), keyCopy(undefined).size);
a.value = 3;
for (const key of keyClone) console.log(key === a, key.value);
function keyArray(value: Key[] | null): Set<Key> { return new Set(value); }
const arrayClone = keyArray([a, b, a]);
console.log(arrayClone.size, arrayClone.has(a), arrayClone.has(b), keyArray(null).size);

// Plain indexed reads can be absent even with a non-optional checker type.
const collections: Set<string>[] = [original];
console.log(values(new Set(collections[0])), new Set(collections[3]).size);
