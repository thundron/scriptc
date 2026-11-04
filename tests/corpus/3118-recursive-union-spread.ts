// Recursive union arms can have identical stored layouts while carrying
// different literal discriminants. Rebuilding one must keep its own arm.
type Expression =
  | { kind: "number"; value: number }
  | { kind: "binary"; op: "+" | "-"; left: Expression; right: Expression }
  | { kind: "logical"; op: "and" | "or"; left: Expression; right: Expression };
type Binary = Extract<Expression, { kind: "binary" }>;
type Logical = Extract<Expression, { kind: "logical" }>;

function binary(expr: Binary): number {
  const left = evaluate(expr.left);
  const right = evaluate(expr.right);
  return expr.op === "+" ? left + right : left - right;
}
function logical(expr: Logical): number {
  const left = evaluate(expr.left);
  return expr.op === "and" ? (left ? evaluate(expr.right) : left) : (left || evaluate(expr.right));
}
function evaluate(expr: Expression): number {
  switch (expr.kind) {
    case "number": return expr.value;
    case "binary": return binary(expr);
    case "logical": return logical(expr);
  }
}
function rewrite(expr: Expression): Expression {
  switch (expr.kind) {
    case "number": return { ...expr, value: expr.value + 1 };
    case "binary": return { ...expr, left: rewrite(expr.left), right: rewrite(expr.right) };
    case "logical": return { ...expr, left: rewrite(expr.left), right: rewrite(expr.right) };
  }
}

const left: Expression = { kind: "number", value: 3 };
const right: Expression = { kind: "number", value: 5 };
const sum: Binary = { kind: "binary", op: "+", left, right };
const difference: Binary = { kind: "binary", op: "-", left: sum, right };
const both: Logical = { kind: "logical", op: "and", left: difference, right: sum };
const either: Logical = { kind: "logical", op: "or", left: both, right };
for (const input of [sum, difference, both, either] as Expression[]) {
  const output = rewrite(input);
  console.log(input.kind, evaluate(input), output.kind, evaluate(output));
}

// Last-write-wins applies to discriminants as well as ordinary fields.
function asBinary(expr: Logical): Expression {
  return { ...expr, kind: "binary", op: "+" };
}
function asLogical(expr: Binary): Expression {
  return { ...expr, kind: "logical", op: "and" };
}
console.log("overridden", evaluate(asBinary(both)), evaluate(asLogical(sum)));

// Explicit fields before the spread are replaced by the source's fields.
function before(expr: Binary): Expression {
  const initial = { kind: "logical" as const, op: "or" as const };
  return { ...initial, ...expr };
}
console.log("spread-order", evaluate(before(difference)));

// Rebuilds allocate a new parent and retain the original child objects.
function shallow(expr: Expression): Expression {
  switch (expr.kind) {
    case "number": return { ...expr };
    case "binary": return { ...expr, op: "+" };
    case "logical": return { ...expr, op: "or" };
  }
}
const copied = shallow(sum);
if (copied.kind === "binary") {
  console.log("identity", copied === sum, copied.left === left, copied.right === right);
}

// Selecting the destination arm must not evaluate a source or override.
const effects: string[] = [];
function source(): Binary { effects.push("source"); return sum; }
function operand(name: string, value: number): Expression {
  effects.push(name);
  return { kind: "number", value };
}
function ordered(): Expression {
  return { ...source(), left: operand("left", 10), right: operand("right", 20) };
}
console.log("evaluation", evaluate(ordered()), effects.join(","));
