// The object type proves that a value is not a primitive. It does not
// prove that the value has no enumerable fields, even though keyof is never.
function show(value: unknown): void {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    console.log(key, typeof entry, JSON.stringify(entry));
  }
  console.log(Object.values(value).map((entry) => typeof entry).join(","));
}
show(JSON.parse('{"name":"package","version":2,"active":true,"missing":null,"nested":{"value":3}}'));
show(JSON.parse('{}'));
show(null);
show([1, 2]);

function dictionary(value: object): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) out[key] = entry;
  return out;
}
console.log(JSON.stringify(dictionary(JSON.parse('{"a":"first","b":false}'))));
const opaque: object = JSON.parse('{"left":[1,2],"right":{"value":3}}');
const entries = Object.entries(opaque);
const values = Object.values(opaque);
console.log(entries.length, values.length, entries[0]?.[1] === values[0]);
console.log(JSON.stringify(entries));

// A declared shape keeps its useful value type.
const numbers = { first: 2, second: 3 };
console.log(Object.values(numbers).reduce((sum, number) => sum + number, 0));
console.log(Object.entries(numbers).map(([key, number]) => key + ":" + (number * 2)).join(","));

// An unchecked key keeps JavaScript's property spelling when absent.
const names = ["present"];
const open: Record<string, unknown> = {};
open[names[0]!] = 1;
const missing = names[3];
open[missing] = 2;
console.log(JSON.stringify(open));
console.log(open[missing]);

function selected(flag: boolean, value: Record<string, unknown>): void {
  const presentFirst = flag ? Object.entries(value).filter(([, item]) => item !== null) : [];
  const emptyFirst = flag ? [] : Object.entries(value).filter(([, item]) => item !== null);
  console.log(JSON.stringify(Object.fromEntries(presentFirst)));
  console.log(JSON.stringify(Object.fromEntries(emptyFirst)));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null))));
}
selected(true, { left: 1, absent: null, right: "two" });
selected(false, { left: 1, absent: null, right: "two" });

// Entry tuples can live in either the native tuple layout or the dynamic
// array returned by enumeration. Both retain Array.prototype.join behavior.
console.log(Object.entries(opaque)[0].join(":"));
console.log(Object.entries(numbers)[1].join("="));
const tuple: [string, unknown, null, undefined] = ["key", true, null, undefined];
console.log(tuple.join(), tuple.join(undefined), tuple.join("|"));
let receiverCalls = 0;
function tupleReceiver(): [string, unknown, null, undefined] {
  receiverCalls++;
  return tuple;
}
function separator(): string {
  tuple[1] = 42;
  return ":";
}
console.log(tupleReceiver().join(separator()), receiverCalls);
const rows: [string, number][] = [["first", 1], ["second", 2]];
console.log(rows[1].join("="));
try { console.log(rows[9].join()); }
catch (error) { console.log(error instanceof TypeError); }
