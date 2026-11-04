export {};

type Type =
  | { kind: "number" }
  | { kind: "text" }
  | { kind: "array"; element: Type }
  | { kind: "record"; shapeId: string };

// TypeScript distributes this over all variants. Conflicting `kind`
// intersections are never even when the client retains intersection flags.
type RecordType = Type & { kind: "record" };
function shape(type: RecordType): string { return type.shapeId; }
function construct(shapeId: string): RecordType { return { kind: "record", shapeId }; }
console.log(shape(construct("user")));

interface GeneratorInfo {
  resultType: RecordType;
  yielded: Type;
}
function generator(info: GeneratorInfo): string {
  return info.resultType.shapeId + ":" + info.yielded.kind;
}
console.log(generator({ resultType: construct("result"), yielded: { kind: "array", element: { kind: "number" } } }));

// Multiple surviving arms retain separate payloads; impossible variants
// must not add tags or force a union of empty records into the native ABI.
type Container = Type & { kind: "array" | "record" };
function describe(type: Container): string {
  if (type.kind === "record") return "record:" + type.shapeId;
  return "array:" + type.element.kind;
}
console.log(describe({ kind: "array", element: { kind: "text" } }));
console.log(describe(construct("named")));

type Expr =
  | { kind: "literal"; value: number; type: Type }
  | { kind: "binary"; left: Expr; right: Expr; type: Type }
  | { kind: "call"; name: string; args: Expr[]; type: Type };
type Binary = Expr & { kind: "binary" };
type Call = Expr & { kind: "call" };
const numberType: Type = { kind: "number" };
const literal: Expr = { kind: "literal", value: 3, type: numberType };
const binary: Binary = { kind: "binary", left: literal, right: literal, type: numberType };
function weight(expr: Expr): number {
  switch (expr.kind) {
    case "literal": return expr.value;
    case "binary": return weight(expr.left) + weight(expr.right);
    case "call": return expr.args.reduce((sum, arg) => sum + weight(arg), 0);
  }
}
function children(expr: Binary | Call): Expr[] {
  return expr.kind === "binary" ? [expr.left, expr.right] : expr.args;
}
const call: Call = { kind: "call", name: "sum", args: [binary, literal], type: numberType };
console.log(weight(call), children(binary).length, children(call).length);

// Utility types and nested nullable fields use the same reduced unions.
type Selected<K extends Expr["kind"]> = Expr & { kind: K };
function callName(expr: Selected<"call"> | undefined): string {
  return expr?.name ?? "none";
}
console.log(callName(call), callName(undefined));
const registry = new Map<string, { type: RecordType | null }>([
  ["known", { type: construct("known") }],
  ["none", { type: null }],
]);
for (const key of ["known", "none", "absent"]) {
  console.log(registry.get(key)?.type?.shapeId ?? "missing");
}

// Different instantiations must not reuse the first intersection's
// resolved type or tag layout.
function identity<T>(value: T): T { return value; }
console.log(shape(identity<RecordType>(construct("second"))));
console.log(weight(identity<Binary>(binary)));
console.log(weight(identity<Call>(call)));
