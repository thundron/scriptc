// Compiler-like constructors pass recursive union values through parameters,
// unchecked array reads, and record fields before returning a tagged literal.
type ValueType = { kind: "number" } | { kind: "array"; elem: ValueType } | { kind: "choice"; arms: ValueType[] };
type Expr =
  | { kind: "var"; name: string; type: ValueType }
  | { kind: "self"; type: ValueType }
  | { kind: "number"; value: number; type: ValueType }
  | { kind: "pair"; left: Expr; right: Expr; type: ValueType };

function variable(name: string, type: ValueType): Expr { return { kind: "var", name, type }; }
function self(type: ValueType): Expr { return ({ kind: "self", type }); }
function number(value: number, type: ValueType): Expr { return { kind: "number", value, type }; }
function pair(left: Expr, right: Expr, type: ValueType): Expr { return { kind: "pair", left, right, type }; }
function describeType(type: ValueType): string {
  switch (type.kind) {
    case "number": return "number";
    case "array": return `array(${describeType(type.elem)})`;
    case "choice": return type.arms.map(describeType).join("|");
  }
}
function describe(expr: Expr): string {
  switch (expr.kind) {
    case "var": return `var:${expr.name}:${describeType(expr.type)}`;
    case "self": return `self:${describeType(expr.type)}`;
    case "number": return `number:${expr.value}:${describeType(expr.type)}`;
    case "pair": return `(${describe(expr.left)},${describe(expr.right)}):${describeType(expr.type)}`;
  }
}
function argument(expr: Expr): string { return describe(expr); }
function recordField(expr: Expr): { expr: Expr } { return { expr }; }
function arrayElement(expr: Expr): Expr[] { return [expr]; }
function callback(fn: () => Expr): Expr { return fn(); }

const types: ValueType[] = [{ kind: "number" }, { kind: "array", elem: { kind: "number" } }];
const scalar = types[0]!;
const array = types[1]!;
console.log("returns", describe(variable("x", scalar)), describe(self(array)), describe(number(7, scalar)));
console.log("arguments", argument({ kind: "var", name: "argument", type: scalar }));
console.log("field", describe(recordField({ kind: "var", name: "field", type: array }).expr));
console.log("element", describe(arrayElement({ kind: "var", name: "element", type: scalar })[0]!));
console.log("callback", describe(callback(() => ({ kind: "var", name: "callback", type: array }))));
console.log("nested", describe(pair(variable("left", scalar), self(array), { kind: "choice", arms: types })));

// The target has a smaller arm (self) with a structurally compatible layout.
// Literal ownership selects var before any payload adaptation occurs.
function fromRecord(input: { name: string; type: ValueType }): Expr {
  return { kind: "var", name: input.name, type: input.type };
}
function fromArray(input: ValueType[], index: number): Expr {
  return { kind: "var", name: "indexed", type: input[index] };
}
function fromNested(input: { types: ValueType[] }): Expr {
  return { kind: "var", name: "nested", type: input.types[0]! };
}
console.log("record-source", describe(fromRecord({ name: "record", type: array })));
console.log("array-source", describe(fromArray(types, 1)));
console.log("nested-source", describe(fromNested({ types })));
type MaybeExpr =
  | { kind: "var"; name: string; type: ValueType | undefined }
  | { kind: "self"; type: ValueType | undefined };
function optionalFromArray(input: ValueType[], index: number): MaybeExpr {
  return { kind: "var", name: "optional", type: input[index] };
}
const missing = optionalFromArray([], 0);
console.log("missing-payload", missing.kind, missing.type === undefined);
try { console.log(missing.type!.kind); }
catch (error) { if (error instanceof TypeError) console.log("missing-read", error.name); }

const effects: string[] = [];
function name(label: string): string { effects.push(label); return label; }
function type(label: string, value: ValueType): ValueType { effects.push(label); return value; }
function ordered(): Expr { return { kind: "var", name: name("name"), type: type("type", scalar) }; }
console.log("ordered", describe(ordered()), effects.join(","));
effects.length = 0;
function source(): { name: string; type: ValueType } {
  effects.push("spread");
  return { name: "spread", type: scalar };
}
function spread(): Expr { return { kind: "var", ...source(), type: type("override", array) }; }
console.log("spread", describe(spread()), effects.join(","));
effects.length = 0;
function stop(): ValueType { effects.push("throw"); throw new RangeError("payload"); }
function throws(): Expr { return { kind: "var", name: name("before"), type: stop() }; }
try { console.log(describe(throws())); }
catch (error) { if (error instanceof RangeError) console.log("caught", error.name, error.message, effects.join(",")); }

// Shared child storage keeps identity across literal conversion. Each new
// parent must still allocate its own object and evaluate each property once.
const original = variable("original", array);
const parent = pair(original, original, scalar);
if (parent.kind === "pair") {
  console.log("children", parent.left === original, parent.right === original);
  if (parent.left.kind === "var") console.log("payload", parent.left.type === array);
}
let checksum = 0;
for (let i = 0; i < 100; i++) {
  const item = number(i, types[i % types.length]!);
  if (item.kind === "number") checksum += item.value;
}
console.log("repeated", checksum);
