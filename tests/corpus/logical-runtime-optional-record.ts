type ValueType = { kind: "number" } | { kind: "object"; name: string };
type Expression =
  | { kind: "number"; type: ValueType; value: number }
  | { kind: "binary"; type: ValueType; left: Expression; right: Expression }
  | { kind: "call"; type: ValueType; args: Expression[] };

let predicateCalls = 0;
function isObject(type: ValueType): boolean {
  predicateCalls++;
  return type.kind === "object";
}

let tailCalls = 0;
function tail(): string {
  tailCalls++;
  return "ready";
}

function check(expression: Expression): void {
  if (expression.kind !== "call") return;
  const first = expression.args[0];
  const valid = first && isObject(first.type);
  const chained = first && isObject(first.type) && tail();
  console.log(valid, chained, predicateCalls, tailCalls);
}

let reads = 0;
function read(values: Expression[]): Expression {
  reads++;
  return values[0];
}

function evaluateOnce(values: Expression[]): void {
  const value = read(values) && tail();
  console.log(value, reads, tailCalls);
}

const number: Expression = { kind: "number", type: { kind: "number" }, value: 1 };
const binary: Expression = { kind: "binary", type: { kind: "number" }, left: number, right: number };
const object: Expression = { kind: "number", type: { kind: "object", name: "sample" }, value: 2 };
check({ kind: "call", type: { kind: "number" }, args: [] });
check({ kind: "call", type: { kind: "number" }, args: [binary] });
check({ kind: "call", type: { kind: "number" }, args: [object] });
evaluateOnce([]);
evaluateOnce([binary]);

function scalarChoices(values: boolean[]): void {
  const both = values[0] && values[1];
  const either = values[0] || values[1];
  const fallback = values[0] || false;
  console.log(both, either, fallback);
}
scalarChoices([]);
scalarChoices([false]);
scalarChoices([true]);
scalarChoices([false, true]);
scalarChoices([true, false]);

function explicitUnits(value: Expression | null | undefined): void {
  const result = value && isObject(value.type);
  console.log(result);
}
explicitUnits(null);
explicitUnits(undefined);
explicitUnits(binary);
explicitUnits(object);
