interface Entry { name: string; base: string | null; count: number }
let calls = 0;
function count(label: string): number {
  console.log("seed", label);
  return ++calls;
}

const table: ReadonlyMap<string, Entry> = new Map([
  ["root", { name: "root", base: null, count: count("root") }],
  ["child", { name: "child", base: "root", count: count("child") }],
  ["root", { name: "replacement", base: "child", count: count("replacement") }],
]);
for (const [key, entry] of table) console.log(key, entry.name, entry.base, entry.count);
console.log(table.size, calls);

function make(): Map<string, Entry> {
  return new Map([["null", { name: "null", base: null, count: 4 }]]);
}
const returned = make();
returned.set("value", { name: "value", base: "null", count: 5 });
console.log(returned.get("null")?.base, returned.get("value")?.base);

function show(values: ReadonlyMap<number, Entry>): void {
  for (const [key, value] of values) console.log(key, value.name, value.base);
}
show(new Map([[1, { name: "argument", base: null, count: 6 }]]));

const shared: Entry = { name: "shared", base: null, count: 7 };
const aliases: Map<string, Entry> = new Map([["same", shared]]);
shared.base = "changed";
console.log(aliases.get("same") === shared, aliases.get("same")?.base);
const empty: Map<string, Entry> = new Map();
empty.set("new", shared);
console.log(empty.get("new") === shared);

// `satisfies` preserves the inferred map, including its narrower values.
const checked = new Map([["checked", { name: "checked", base: "root", count: 8 }]]) satisfies ReadonlyMap<string, Entry>;
console.log(checked.get("checked")?.base);
const explicit: Map<string, Entry> = new Map<string, Entry>([["explicit", { name: "explicit", base: null, count: 9 }]]);
console.log(explicit.get("explicit")?.base);
