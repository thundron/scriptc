function own<T>(table: Record<string, T | undefined>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}
const scalars: Record<string, number | string | boolean | undefined> = {
  number: 3, string: "text", boolean: false, empty: undefined,
};
for (const key of ["number", "string", "boolean", "empty", "missing", "constructor", "toString"]) {
  console.log(key, own(scalars, key));
}
type Value = { kind: "number"; value: number } | { kind: "list"; values: Value[] };
const child: Value = { kind: "number", value: 4 };
const values: Record<string, Value | undefined> = { child, tree: { kind: "list", values: [child] } };
const found = own(values, "child");
console.log("identity", found === child);
const tree = own(values, "tree");
if (tree?.kind === "list") console.log("nested", tree.values[0] === child, tree.values.length);
console.log("absent", own(values, "no") === undefined);
