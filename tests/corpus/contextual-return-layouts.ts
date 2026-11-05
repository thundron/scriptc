type Value =
  | { kind: "leaf"; value: number }
  | { kind: "list"; values: Value[] }
  | { kind: "empty" };
type Statement =
  | { kind: "value"; value: Value }
  | { kind: "block"; body: Statement[] }
  | { kind: "branch"; then: Statement[]; else_: Statement[] | null };

const events: string[] = [];
function leaf(value: number): Value { events.push(`leaf:${value}`); return { kind: "leaf", value }; }
function statements(make: () => Statement[]): Statement[] { return make(); }
function value(make: () => Value): Value { return make(); }
function record(make: () => { values: Value[]; label: string }): { values: Value[]; label: string } { return make(); }

function read(input: Value): number {
  switch (input.kind) {
    case "leaf": return input.value;
    case "empty": return 0;
    case "list": return input.values.reduce((sum, item) => sum + read(item), 0);
  }
}
function run(body: Statement[]): number {
  let total = 0;
  for (const stmt of body) {
    switch (stmt.kind) {
      case "value": total += read(stmt.value); break;
      case "block": total += run(stmt.body); break;
      case "branch": total += run(stmt.then) + (stmt.else_ ? run(stmt.else_) : 0); break;
    }
  }
  return total;
}

function conditional(flag: boolean): Statement[] {
  return flag
    ? [{ kind: "branch", then: [{ kind: "value", value: leaf(3) }], else_: [] }]
    : [{ kind: "block", body: [{ kind: "value", value: leaf(4) }] }];
}
function concise(flag: boolean): Statement[] {
  return statements(() => flag
    ? [{ kind: "value", value: leaf(5) }, { kind: "block", body: [] }]
    : [{ kind: "branch", then: [], else_: [{ kind: "value", value: leaf(6) }] }]);
}
function block(): Statement[] {
  return statements(function () {
    const existing = leaf(7);
    return [{ kind: "branch", then: [{ kind: "value", value: existing }], else_: null }];
  });
}
console.log("branches", run(conditional(true)), run(conditional(false)), run(concise(true)), run(concise(false)), run(block()));
console.log("effects", events.join(","));
events.length = 0;

// Nested satisfies and parentheses keep the inferred value but expose its
// fresh construction to a real destination. Assertions retain their own
// conversion, and an existing child remains the same reference.
const shared = leaf(8);
function wrapped(): Value {
  return ((({ kind: "list", values: [shared, { kind: "leaf", value: 9 }] }) satisfies Value));
}
const selected = value(() => (({ kind: "list", values: [shared] }) satisfies Value));
if (selected.kind === "list") console.log("identity", selected.values[0] === shared);
console.log("satisfies", read(wrapped()), read(selected));
const wide = { kind: "leaf" as const, value: 10, extra: "kept" } satisfies Value & { extra: string };
console.log("own-shape", wide.extra, wide.kind, wide.value);

const recordResult = record(() => ({ values: [{ kind: "list", values: [shared] }, { kind: "empty" }], label: "record" }));
console.log(recordResult.label, recordResult.values.reduce((sum, entry) => sum + read(entry), 0));

function maps(flag: boolean): Map<string, Value> | null { return flag ? new Map() : null; }
function sets(): Set<string> | undefined { return new Set(); }
const left = maps(true)!;
const right = maps(true)!;
left.set("value", shared);
console.log("maps", left.size, right.size, left.get("value") === shared, maps(false) === null);
const names = sets()!;
names.add("first");
console.log("sets", names.has("first"), sets()!.size);

// Standard library callbacks keep their inferred contracts: changing
// flatMap's U | readonly U[] signature would change its flattening ABI.
const flattened = [1, 2, 3].flatMap((n) => n % 2 === 0 ? [n, n + 10] : [n]);
console.log("flat-map", flattened.join(","));

// A throwing branch must prevent later property effects. The other
// branch must remain callable after the failed construction unwinds.
function failure(): Value { events.push("throw"); throw new RangeError("value"); }
function throws(flag: boolean): Statement[] {
  return statements(() => flag
    ? [{ kind: "value", value: failure() }, { kind: "value", value: leaf(100) }]
    : [{ kind: "value", value: leaf(11) }]);
}
try { console.log(run(throws(true))); }
catch (error) { if (error instanceof RangeError) console.log("caught", error.name, error.message); }
console.log("recovery", run(throws(false)), events.join(","));
export {};
