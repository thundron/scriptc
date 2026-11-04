interface Entry { kind: string; tag: number; values: string[] }

const source: Entry[] = [
  { kind: "first", tag: 1, values: ["one"] },
  { kind: "second", tag: 2, values: ["two"] },
];
const defaults: Entry = { kind: "absent", tag: -1, values: ["default"] };
// Even dense slice callbacks use the runtime-optional record ABI.
const dense = source.slice().map((entry) => ({ ...defaults, ...entry, label: "copy" }));
console.log("dense", dense.map((entry) => entry.kind).join(","));
const selected: (Entry | undefined)[] = source.slice();
// An explicit undefined slot is visited by map, unlike a hole.
selected.push(undefined);
const copied = selected.map((entry, index) => ({ ...defaults, ...entry, index }));
for (const entry of copied) {
  console.log(entry.kind, entry.tag, entry.values.join(","), entry.index);
}
const firstCopy = copied[0];
if (firstCopy !== undefined) firstCopy.kind = "changed";
console.log("fresh", source[0]!.kind, copied[0]!.kind);
console.log("shared", copied[0]!.values === source[0]!.values);
console.log("default", copied[2]!.values === defaults.values);
copied[0]!.values.push("retained");
console.log("source", source[0]!.values.join(","));

// The lowered source can also be narrower than its checker union.
const narrowed = selected.filter((entry) => entry !== undefined).map((entry) => {
  if (entry === undefined) return { ...defaults, label: "empty" };
  return { ...defaults, ...entry, label: "present:" + entry.kind };
});
for (const entry of narrowed) console.log(entry.kind, entry.label);

// Later explicit fields replace source fields, including absent sources.
const overwritten = selected.map((entry, index) => ({
  ...entry, kind: "override", tag: index, values: ["new"],
}));
for (const entry of overwritten) console.log(entry.kind, entry.tag, entry.values.join(","));

// Declared optional destinations represent the no-copy arm directly.
interface Optional { kind?: string; tag?: number; values?: string[]; index: number }
const optional = selected.map((entry, index): Optional => ({ ...entry, index }));
for (const entry of optional) {
  console.log(entry.kind ?? "missing", entry.tag ?? -2, entry.values?.join(",") ?? "missing", entry.index);
}
