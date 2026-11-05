export {};

type Type = { kind: "scalar"; name: string } | { kind: "array"; element: Type };
const numberType: Type = { kind: "scalar", name: "number" };
function signature(used: boolean, element: Type): { args: Type[]; result: Type } {
  const inferred = used ? { args: [element], result: element } : { args: [], result: numberType };
  return inferred;
}
for (const flag of [true, false]) {
  const result = signature(flag, { kind: "array", element: numberType });
  console.log(JSON.stringify(result));
  result.args.push(numberType);
  console.log(result.args.length);
}

// Either side can contain the empty literal, with multiple nested arrays.
function nested(flag: boolean, item: Type): void {
  const row = flag
    ? { info: { values: [], backup: [[item]] }, args: [] }
    : { info: { values: [item], backup: [] }, args: [item] };
  console.log(JSON.stringify(row));
}
nested(true, numberType);
nested(false, numberType);

// Only the selected branch evaluates, in written property order.
let order = "";
function mark(label: string): Type { order += label; return numberType; }
function ordered(flag: boolean): void {
  const result = flag ? { args: [mark("A")], result: mark("B") } : { args: [], result: mark("C") };
  console.log("ordered", result.args.length, order);
}
ordered(true);
ordered(false);

// Existing arrays preserve identity through the freshly constructed record.
const shared: Type[] = [numberType];
const joined = shared.length > 0 ? { args: shared, result: numberType } : { args: [], result: numberType };
joined.args.push({ kind: "array", element: numberType });
console.log("identity", joined.args === shared, shared.length);

// A nested conditional can have two empty arms even though an outer arm
// supplies the element type. The outer join must reach both inner records.
function operation(method: string, item: Type): void {
  const sig = method === "push" ? { args: [item], result: numberType }
    : method === "pop" ? { args: [], result: item }
    : { args: [], result: numberType };
  console.log("nested join", method, JSON.stringify(sig));
}
for (const method of ["push", "pop", "length"]) operation(method, numberType);
