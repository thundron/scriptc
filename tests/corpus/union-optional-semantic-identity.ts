type Value =
  | { kind: "empty"; label: string }
  | { kind: "number"; value: number; label: string }
  | { kind: "pair"; left: Value; right: Value; label: string };
type Located = Value & { source: { file: string; line: number } };

function read(value: Value): string {
  switch (value.kind) {
    case "empty": return value.label;
    case "number": return `${value.label}:${value.value}`;
    case "pair": return `${value.label}(${read(value.left)},${read(value.right)})`;
  }
}
function optional(value: Value | undefined): Value | undefined { return value; }
function nullable(value: Value | null): Value | null | undefined { return value; }
function located(value: Located | undefined): Value | undefined { return value; }
function required(value: Value | undefined): Value {
  if (value === undefined) return { kind: "empty", label: "default" };
  return value;
}
function widened(value: Value | undefined): Value | string | undefined { return value; }
function arrayRead(values: Value[], index: number): Value | undefined { return values[index]; }
function box(value: Value | undefined): { value?: Value } { return value === undefined ? {} : { value }; }

const empty: Value = { kind: "empty", label: "empty" };
const number: Value = { kind: "number", value: 11, label: "number" };
const pair: Value = { kind: "pair", left: empty, right: number, label: "pair" };
const values: Value[] = [empty, number, pair];
for (const value of values) {
  console.log("optional", read(required(optional(value))), optional(value) === value);
  const candidate = nullable(value);
  if (candidate != null) console.log("nullable", read(candidate), candidate === value);
  const scalarSibling = widened(value);
  if (scalarSibling !== undefined && typeof scalarSibling !== "string") {
    console.log("widened", read(scalarSibling));
  }
  console.log("chain", optional(value)?.label, box(value).value?.label);
}
console.log("units", optional(undefined) === undefined, nullable(null) === null);
console.log("absent", box(undefined).value?.label, optional(undefined)?.label);
console.log("fallback", read(required(undefined)));
console.log("array", arrayRead(values, 8)?.label, arrayRead(values, 2)?.label);

const locations: Located[] = [
  { kind: "empty", label: "located-empty", source: { file: "a.ts", line: 1 } },
  { kind: "number", value: 19, label: "located-number", source: { file: "a.ts", line: 2 } },
  { kind: "pair", left: empty, right: number, label: "located-pair", source: { file: "b.ts", line: 3 } },
];
for (const value of locations) console.log("located", read(required(located(value))));
console.log("located-absent", located(undefined) === undefined);

// Adding scalar needles for equality search must leave record identities and
// discriminator ownership unchanged, including a miss and an absent element.
console.log("search", values.includes(number), values.indexOf(pair), values.lastIndexOf(empty));
console.log("new-object", values.includes({ kind: "number", value: 11, label: "number" }));
const mixed: (Value | string)[] = [empty, "marker", number, pair, number];
console.log("mixed-search", mixed.includes("marker"), mixed.indexOf(number), mixed.lastIndexOf(number));
console.log("mixed-miss", mixed.includes("absent"), mixed.indexOf("absent"));

let calls = 0;
function next(present: boolean): Value | undefined { calls++; return present ? pair : undefined; }
console.log("chain-effects", next(true)?.label, calls, next(false)?.label, calls);
console.log("nullish-effects", read(next(false) ?? number), calls);
console.log("logical-effects", next(true) && "yes", calls);

// Same stored shapes with a different semantic contract must never borrow
// another union's literal-to-layout mapping from a registry cache.
type Other = { kind: "none"; label: string } | { kind: "some"; value: number; label: string };
function other(value: Other | undefined): string {
  if (value === undefined) return "missing";
  return value.kind === "none" ? value.label : `${value.label}:${value.value}`;
}
const others: Other[] = [{ kind: "none", label: "none" }, { kind: "some", value: 23, label: "some" }];
console.log("separate", other(others[0]), other(others[1]), other(others[2]));
for (let i = 0; i < 60; i++) {
  const value = optional(values[i % values.length]);
  if (value) console.log("loop", i, read(value));
}
