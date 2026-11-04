interface Options { strict?: boolean; target?: number; label?: string; paths?: string[] }
const defaults: Options = { strict: false, target: 1, label: "default", paths: ["src"] };
const overrides: Record<string, unknown> = { strict: true, label: "configured" };
const forced = { target: 7 };
const merged: Options = { ...defaults, ...overrides, ...forced };
console.log(merged.strict, merged.target, merged.label, merged.paths?.join(","));
console.log(merged.paths === defaults.paths);
merged.paths!.push("shared");
console.log(defaults.paths!.join(","));
console.log(Object.keys(merged).join(","));

interface Hybrid { label?: string; [key: string]: unknown }
const hybrid: Hybrid = { label: "declared" };
hybrid["strict"] = true;
hybrid["target"] = 12;
const hybridCopy: Options = { ...defaults, ...hybrid };
console.log(hybridCopy.label, hybridCopy.strict, hybridCopy.target);

const events: string[] = [];
function first(): Options { events.push("first"); return defaults; }
function later(): Record<string, unknown> {
  events.push("later");
  defaults.label = "mutated";
  defaults.target = 99;
  return { strict: true };
}
const ordered: Options = { ...first(), ...later() };
console.log(ordered.label, ordered.target, defaults.label, defaults.target);
console.log(events.join(","));

const earlier: Record<string, unknown> = { label: "snapshot" };
function changeEarlier(): Options { earlier["label"] = "changed"; return { target: 5 }; }
const indexedFirst: Options = { ...earlier, ...changeEarlier() };
console.log(indexedFirst.label, earlier["label"], indexedFirst.target);

const absent: Options = {};
const keepEarlier: Options = { ...overrides, ...absent };
console.log(keepEarlier.strict, keepEarlier.label);
const explicit: Record<string, unknown> = { label: undefined };
const unset: Options = { ...defaults, ...explicit };
console.log(unset.label === undefined, unset.strict, unset.target);

const wrong: Record<string, unknown> = { strict: "wrong" };
function last(): Options { return { label: "unreachable" }; }
try {
  const invalid: Options = { ...defaults, ...wrong, ...last() };
  // Type-directed keyed collisions validate when written into a typed
  // record. Node's erased annotation allows the value until this use.
  if (typeof invalid.strict !== "boolean") throw new TypeError("wrong boolean");
} catch (error) {
  console.log("invalid", error instanceof TypeError);
}
console.log("recovered", merged.label);

function combined(a: Options, b: Record<string, unknown>): Options { return { ...a, ...b }; }
console.log(combined({}, {}).label === undefined);
console.log(combined({ label: "before" }, { label: "after" }).label);

const nullSource: unknown = null;
const undefinedSource: unknown = undefined;
console.log(combined({ label: "null preserved" }, nullSource as Record<string, unknown>).label);
console.log(combined({ label: "undefined preserved" }, undefinedSource as Record<string, unknown>).label);
