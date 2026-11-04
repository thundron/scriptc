export {};

const table: Record<string, number | undefined> = { first: 1, empty: undefined, ["__proto__"]: undefined };
function report(key: string): void {
  console.log(key, Object.hasOwn(table, key), Object.prototype.hasOwnProperty.call(table, key),
    Object.prototype.propertyIsEnumerable.call(table, key));
}
for (const key of ["first", "empty", "missing", "toString", "constructor", "hasOwnProperty", "__proto__"]) report(key);
table["toString"] = 2;
table["__proto__"] = 3;
table["constructor"] = undefined;
for (const key of ["toString", "constructor", "__proto__"]) report(key);
delete table["first"];
delete table["empty"];
report("first");
report("empty");
table["empty"] = undefined;
report("empty");

// Mixed records check declared fields first, then the overflow map.
interface Hybrid { fixed: number; optional?: number; [key: string]: number | undefined }
const hybrid: Hybrid = { fixed: 4 };
hybrid["extra"] = undefined;
for (const key of ["fixed", "optional", "extra", "missing"]) {
  console.log("hybrid", key, Object.hasOwn(hybrid, key));
}
hybrid.optional = 5;
console.log("optional present", Object.hasOwn(hybrid, "optional"));

const recursive: Record<string, { values: number[] } | undefined> = { item: { values: [1, 2] } };
console.log("recursive", Object.hasOwn(recursive, "item"), Object.hasOwn(recursive, "toString"));
let order = "";
function receiver(): typeof table { order += "R"; return table; }
function key(): string { order += "K"; return "empty"; }
console.log("order", Object.hasOwn(receiver(), key()), order);
table["0"] = 0;
table["1.5"] = 1;
console.log("keys", Object.hasOwn(table, -0), Object.hasOwn(table, 1.5));
console.log("bigint key", Object.hasOwn(table, 0n as never), Object.prototype.hasOwnProperty.call(table, 0n as never));

// An unchecked external index can yield undefined at runtime. Its key is
// the string "undefined", not an invalid native string pointer.
const keys = ["first"];
const missed = keys[4];
table["undefined"] = 6;
console.log("missing key", Object.hasOwn(table, missed as never), Object.prototype.hasOwnProperty.call(table, missed as never));
