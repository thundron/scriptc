interface PackageData { name?: string; exports: unknown; workspaces: unknown }
const pkg: PackageData = {
  name: "fixture",
  exports: { ".": { import: "./esm.js", require: "./cjs.js" } },
  workspaces: ["packages/*"],
};
console.log(JSON.stringify(pkg));
console.log(JSON.stringify(pkg, null, 2));
pkg.exports = undefined;
pkg.workspaces = null;
console.log(JSON.stringify(pkg));

function valueLabel(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  return "object";
}
const dictionary: Record<string, unknown> = {};
dictionary["label"] = "named";
dictionary["2"] = 2;
dictionary["1"] = 1;
dictionary["empty"] = undefined;
dictionary["nil"] = null;
const children: unknown[] = [3];
dictionary["children"] = children;
console.log(Object.values(dictionary).map(valueLabel).join("|"));
const collected = Object.values(dictionary);
console.log(collected[5] === children);
children.push(4);
console.log(JSON.stringify(collected));
dictionary["label"] = "changed";
console.log(collected[2], Object.values(dictionary)[2]);

interface Fixed { left: unknown; right: unknown }
const fixed: Fixed = { left: children, right: "right" };
const fixedValues = Object.values(fixed);
console.log(fixedValues[0] === children, fixedValues[1]);
console.log(JSON.stringify(fixed));
fixed.right = undefined;
console.log(JSON.stringify(fixed));

interface Envelope { label: string; payload: unknown }
const envelope: Envelope = { label: "before", payload: { nested: [1, undefined, null] } };
console.log(JSON.stringify(envelope));

// Live typed references snapshot the key/length walk, then refresh values
// after an earlier toJSON call mutates a later member.
const numeric = [1, 2, 3];
const changesArray: { trigger: unknown; values: number[] } = { trigger: null, values: numeric };
changesArray.trigger = { toJSON(): string { numeric[1] = 8; return "changed"; } };
console.log(JSON.stringify(changesArray), numeric[1]);
const omitted: unknown = { first: undefined, second: () => "skip", third: 3 };
console.log(JSON.stringify(omitted));
const rootHook: unknown = { toJSON(): string { return "root"; } };
console.log(JSON.stringify(rootHook));

interface Mutable { trigger: unknown; later: string; nested: unknown }
const mutable: Mutable = { trigger: null, later: "before", nested: null };
mutable.trigger = {
  toJSON(key: string): string {
    mutable.later = "after";
    mutable.nested = { observed: true };
    return key;
  },
};
console.log(JSON.stringify(mutable));
console.log(mutable.later);

interface Link { value: unknown; next?: Link }
const link: Link = { value: "cycle" };
link.next = link;
try {
  JSON.stringify(link);
} catch (error) {
  console.log("typed circular", error instanceof TypeError);
}
link.next = undefined;
console.log(JSON.stringify({ left: link, right: link, value: null as unknown }));

const failure: { payload: unknown } = { payload: {
  toJSON(): string { throw new Error("hook failed"); },
} };
try {
  JSON.stringify(failure);
} catch (error) {
  console.log("hook throw", error instanceof Error && error.message === "hook failed");
}
failure.payload = { toJSON(): string { return JSON.stringify({ recursive: true }); } };
console.log(JSON.stringify(failure));
envelope.payload = () => "omitted";
console.log(JSON.stringify(envelope));

const hook: unknown = { toJSON(key: string): string { return "key:" + key; } };
envelope.payload = hook;
console.log(JSON.stringify(envelope));
const tuple: [string, unknown] = ["tuple", hook];
console.log(JSON.stringify(tuple));
const nested: { items: Envelope[] } = { items: [envelope] };
console.log(JSON.stringify(nested));

const cyclic: unknown[] = [];
cyclic.push(cyclic);
envelope.payload = cyclic;
try {
  JSON.stringify(envelope);
} catch (error) {
  console.log("circular", error instanceof TypeError);
}
// Tear down the explicit dyn cycle; the checked-dynamic heap uses RC.
cyclic.pop();
envelope.payload = { after: true };
console.log(JSON.stringify(envelope));
