export {};

// Index signatures add undefined to an already union-valued slot. Its
// original numeric/null tags cannot be interpreted as the wider tags.
const arities: Record<string, number | null> = { fixed: 2, rest: null, zero: 0 };
for (const key of ["fixed", "rest", "zero", "absent"]) {
  console.log(key, arities[key] ?? "missing", arities[key] === null);
}

type Payload = { name: string; values: number[] };
const entry: Payload = { name: "shared", values: [1, 2] };
const payloads: Record<string, Payload | null> = { present: entry, empty: null };
for (const key of ["present", "empty", "absent"]) {
  const value = payloads[key] ?? undefined;
  if (value) {
    value.values.push(3);
    console.log(value.name, value.values.join(","));
  } else {
    console.log(key, value === null, value === undefined);
  }
}
console.log("identity", entry.values.length);

// Declared fields and overflow entries take separate backend paths.
interface Values {
  declared: number | null;
  [name: string]: number | null;
}
const values: Values = { declared: null, extra: 12 };
for (const key of ["declared", "extra", "absent"]) {
  console.log("hybrid", key, values[key] ?? undefined);
}

// Reads from several record variants join union-valued fields. A tag in
// one field can name a completely different arm in the joined result.
type Numeric = { kind: "number"; value: number | null };
type Textual = { kind: "text"; value: string | null };
function read(value: Numeric | Textual): void {
  console.log("joined", value.value);
}
read({ kind: "number", value: 9 });
read({ kind: "number", value: null });
read({ kind: "text", value: "nine" });
read({ kind: "text", value: null });

type Ref = { kind: "ref"; value: Payload | null };
function readRef(value: Ref | Textual): string {
  const result = value.value;
  if (result === null) return "null";
  if (typeof result === "string") return result;
  result.values.push(4);
  return result.name;
}
console.log(readRef({ kind: "ref", value: entry }));
console.log(readRef({ kind: "ref", value: null }));
console.log(readRef({ kind: "text", value: "text" }));
console.log(entry.values.join(","));

// The same widening can retain an existing undefined arm; missing keys
// and present null values must still have different runtime tags.
const optional: Record<string, number | null | undefined> = { no: undefined, nil: null, yes: 7 };
for (const key of ["no", "nil", "yes", "absent"]) {
  const value = optional[key];
  console.log("optional", key, value === undefined, value === null, value ?? -1);
}

// Repeated owned overflow results exercise release of the original box
// after a new wider box retains its reference payload.
let total = 0;
for (let i = 0; i < 200; i++) {
  const value = payloads[i % 2 === 0 ? "present" : "empty"];
  total += value?.values.length ?? 0;
}
console.log("total", total);
