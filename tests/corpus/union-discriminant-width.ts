// Structural refinements can coalesce source layouts while destination
// variants remain distinct. Dispatch and field reads must agree on the tag.
type Value =
  | { kind: "leaf"; value: number; meta: { category: string } }
  | { kind: "binary"; op: "+" | "-"; left: Value; right: Value; meta: { category: string } }
  | { kind: "logical"; op: "and" | "or"; left: Value; right: Value; meta: { category: string } };
type Refined = Value & { meta: { category: "refined"; serial: number } };

function leaf(value: number): Refined {
  return { kind: "leaf", value, meta: { category: "refined", serial: value } };
}
function binary(left: Value, right: Value): Refined {
  return { kind: "binary", op: "+", left, right, meta: { category: "refined", serial: 3 } };
}
function logical(left: Value, right: Value): Refined {
  return { kind: "logical", op: "or", left, right, meta: { category: "refined", serial: 4 } };
}
function widen(value: Refined): Value { return value; }
function items(values: Refined[]): Value[] { return values; }
function field(value: { payload: Refined }): { payload: Value } { return value; }
function optional(value: Refined | undefined): Value | undefined { return value; }
function factory(read: () => Refined): () => Value { return read; }
function evaluate(value: Value): number {
  switch (value.kind) {
    case "leaf": return value.value;
    case "binary": return value.op === "+" ? evaluate(value.left) + evaluate(value.right) : evaluate(value.left) - evaluate(value.right);
    case "logical": return value.op === "or" ? evaluate(value.left) || evaluate(value.right) : evaluate(value.left) && evaluate(value.right);
  }
}

const a = leaf(0), b = leaf(7);
const inputs = [a, b, binary(a, b), logical(a, b)];
for (const input of inputs) {
  const direct = widen(input);
  console.log(direct.kind, direct.meta.category, evaluate(direct));
  console.log("field", evaluate(field({ payload: input }).payload));
  console.log("callback", evaluate(factory(() => input)()));
  const present = optional(input);
  if (present) console.log("optional", evaluate(present));
}
console.log("missing", optional(undefined) === undefined);
console.log("array", items(inputs).map(evaluate).join(","));
let effects = 0;
function source(): Refined { effects++; return effects % 2 === 0 ? binary(a, b) : logical(a, b); }
console.log("evaluation", evaluate(widen(source())), effects);
console.log("evaluation", evaluate(widen(source())), effects);

// Scalar discriminants use strict comparisons, including zero and false.
type Numeric = { kind: 0; left: number } | { kind: 1; right: number };
type NumericWide = { kind: 0; left: number; extra: string } | { kind: 1; right: number; extra: string };
function numeric(value: NumericWide): Numeric { return value; }
function readNumeric(value: Numeric): number { return value.kind === 0 ? value.left : value.right; }
console.log("numeric", readNumeric(numeric({ kind: 0, left: 11, extra: "zero" })), readNumeric(numeric({ kind: 1, right: 23, extra: "one" })));
type BooleanChoice = { kind: false; left: string } | { kind: true; right: string };
type BooleanWide = { kind: false; left: string; extra: number } | { kind: true; right: string; extra: number };
function boolean(value: BooleanWide): BooleanChoice { return value; }
function readBoolean(value: BooleanChoice): string { return value.kind ? value.right : value.left; }
console.log("boolean", readBoolean(boolean({ kind: false, left: "false", extra: 1 })), readBoolean(boolean({ kind: true, right: "true", extra: 2 })));

// Existing exact-arm paths preserve reference identity after a re-tag.
type Box = { kind: "box"; payload: number[] };
function addUndefined(value: Box | null): Box | null | undefined { return value; }
const box: Box = { kind: "box", payload: [1, 2, 3] };
const retained = addUndefined(box);
console.log("identity", retained === box, retained?.payload === box.payload, addUndefined(null) === null);
for (let i = 0; i < 64; i++) {
  const current = widen(i % 2 === 0 ? binary(a, b) : logical(a, b));
  if (evaluate(current) !== 7) throw new Error("wrong variant payload");
}
console.log("repeated", effects);
