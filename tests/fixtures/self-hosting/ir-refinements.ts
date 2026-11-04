import {
  BOOL, F64, type IrExpr, type IrStmt, type IrType, type SrcLoc,
} from "../../../packages/compiler/src/ir/ir.js";

// Use the production recursive unions. A small hand-written expression
// union does not reproduce the layout coalescing caused by these refinements.
const loc: SrcLoc = { file: "refined.ts", start: 2, end: 7 };
type ArrayExpr = IrExpr & { type: { kind: "array" } };
type RecordExpr = IrExpr & { type: { kind: "record" } };
type StringExpr = IrExpr & { type: { kind: "string" } };

function arrayType(): IrType & { kind: "array" } { return { kind: "array", elem: F64 }; }
function number(value: number): IrExpr { return { kind: "numLit", value, type: F64, loc }; }
function array(value: number): ArrayExpr {
  return { kind: "arrayLit", elems: [number(value)], type: arrayType(), loc };
}
function logical(left: ArrayExpr, right: ArrayExpr): ArrayExpr {
  return { kind: "logical", op: "||", left, right, type: arrayType(), loc };
}
function binary(left: ArrayExpr, right: ArrayExpr): ArrayExpr {
  // This fixture manipulates IR as data, as the lowerer does. Testing all
  // representable variants matters even when an operator is later rejected
  // by the IR validator for the chosen result type.
  return { kind: "bin", op: "+", left, right, type: arrayType(), loc };
}
function conditional(flag: boolean, left: ArrayExpr, right: ArrayExpr): ArrayExpr {
  return { kind: "ternary", cond: { kind: "boolLit", value: flag, type: BOOL, loc }, then: left, else_: right, type: arrayType(), loc };
}
function variable(name: string): ArrayExpr {
  return { kind: "varRef", localId: name, type: arrayType(), loc };
}
function invoke(name: string, args: IrExpr[]): ArrayExpr {
  return { kind: "call", callee: name, args, type: arrayType(), loc };
}
function record(value: number): RecordExpr {
  return { kind: "recordLit", fields: [{ name: "value", value: number(value) }], type: { kind: "record", shapeId: "r0" }, loc };
}
function string(value: string): StringExpr { return { kind: "strLit", value, type: { kind: "string" }, loc }; }
function concat(left: StringExpr, right: StringExpr): StringExpr {
  return { kind: "strConcat", left, right, type: { kind: "string" }, loc };
}

function widenArray(value: ArrayExpr): IrExpr { return value; }
function widenRecord(value: RecordExpr): IrExpr { return value; }
function widenString(value: StringExpr): IrExpr { return value; }
function optional(value: ArrayExpr | undefined): IrExpr | undefined { return value; }
function nullable(value: ArrayExpr | null): IrExpr | null { return value; }
function holder(value: { expr: ArrayExpr }): { expr: IrExpr } { return value; }
function list(values: ArrayExpr[]): IrExpr[] { return values; }
function nested(values: ArrayExpr[][]): IrExpr[][] { return values; }
function callback(read: () => ArrayExpr): () => IrExpr { return read; }
function wrap(value: ArrayExpr): IrExpr { return { kind: "call", callee: "wrap", args: [value], type: F64, loc }; }
function statement(value: ArrayExpr): IrStmt { return { kind: "exprStmt", expr: value, loc }; }

function describe(value: IrExpr): string {
  const prefix = `${value.kind}:${value.type.kind}:${value.loc.start}`;
  switch (value.kind) {
    case "arrayLit": return `${prefix}[${value.elems.map(describe).join(",")}]`;
    case "numLit": return `${prefix}=${value.value}`;
    case "bin": return `${prefix}(${describe(value.left)}${value.op}${describe(value.right)})`;
    case "logical": return `${prefix}(${describe(value.left)}${value.op}${describe(value.right)})`;
    case "ternary": return `${prefix}(${describe(value.cond)}?${describe(value.then)}:${describe(value.else_)})`;
    case "boolLit": return `${prefix}=${value.value}`;
    case "call": return `${prefix}:${value.callee}(${value.args.map(describe).join(",")})`;
    case "varRef": return `${prefix}:${value.localId}`;
    case "recordLit": return `${prefix}{${value.fields.map((field) => `${field.name}=${describe(field.value)}`).join(",")}}`;
    case "strLit": return `${prefix}=${value.value}`;
    case "strConcat": return `${prefix}(${describe(value.left)}+${describe(value.right)})`;
    default: return prefix;
  }
}

const first = array(11);
const second = array(29);
const values: ArrayExpr[] = [
  first, second, binary(first, second), logical(second, first),
  conditional(true, first, second), variable("saved.0"), invoke("make", [number(31)]),
];
for (const value of values) {
  console.log("direct", describe(widenArray(value)));
  console.log("argument", describe(wrap(value)));
  console.log("field", describe(holder({ expr: value }).expr));
  console.log("callback", describe(callback(() => value)()));
  const present = optional(value);
  if (present) console.log("optional", describe(present));
  const nonnull = nullable(value);
  if (nonnull) console.log("nullable", describe(nonnull));
  const stmt = statement(value);
  if (stmt.kind === "exprStmt") console.log("statement", describe(stmt.expr));
}
console.log("absent", optional(undefined) === undefined, nullable(null) === null);
console.log("array", list(values).map(describe).join(";"));
console.log("nested", nested([values, []]).map((group) => group.map(describe).join(";")).join("|"));
console.log("record", describe(widenRecord(record(43))));
console.log("string", describe(widenString(concat(string("left"), string("right")))));

// Each source expression evaluates once. Neither route planning nor
// discriminator dispatch may duplicate calls used as conversion operands.
let evaluations = 0;
function evaluated(): ArrayExpr {
  evaluations++;
  return evaluations % 2 === 0 ? logical(first, second) : binary(first, second);
}
console.log("ordered", describe(wrap(evaluated())), evaluations);
console.log("ordered", describe(wrap(evaluated())), evaluations);
console.log("ordered", describe(holder({ expr: evaluated() }).expr), evaluations);

// Width copies leave children in their existing representations. Repeated
// conversion exercises ownership of the source, result, and discriminator.
let checksum = 0;
for (let i = 0; i < 128; i++) {
  const output = wrap(i % 2 === 0 ? binary(first, second) : logical(second, first));
  if (output.kind === "call") {
    const child = output.args[0]!;
    if (child.kind === "bin" || child.kind === "logical") {
      const operand = child.left;
      if (operand.kind === "arrayLit") {
        const item = operand.elems[0]!;
        if (item.kind === "numLit") checksum += item.value;
      }
    }
  }
}
console.log("checksum", checksum);
