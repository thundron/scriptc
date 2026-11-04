import { boolLit, countedFor, numLit, strLit, varRef } from "../../../packages/compiler/src/ir/build.js";
import { BOOL, F64, STRING, VOID, type IrExpr, type IrFunction, type IrModule, type IrStmt, type IrType, type SrcLoc } from "../../../packages/compiler/src/ir/ir.js";
import { IR_VERSION, deserializeModule, serializeModule } from "../../../packages/compiler/src/ir/serialize.js";
import { validateModule } from "../../../packages/compiler/src/ir/validate.js";

const loc: SrcLoc = { file: "contextual-ir.ts", start: 0, end: 1 };
const bound = Number(process.argv[2] ?? "6");
const events: string[] = [];

// These are the production IR types, including their recursive payloads.
// The smaller layouts within IrExpr and IrStmt must not absorb a literal
// merely because its fields also fit that smaller member structurally.
function argument(value: number): IrExpr {
  events.push(`argument:${value}`);
  return ({ kind: "numLit", value, type: F64, loc } satisfies IrExpr);
}

function arithmetic(negate: boolean, value: IrExpr): IrExpr {
  return negate
    ? { kind: "unary", op: "-", operand: value, type: F64, loc }
    : { kind: "bin", op: "+", left: value, right: numLit(0, loc), type: F64, loc };
}

function factory(make: () => IrStmt[]): IrStmt[] { return make(); }
function expressionFactory(make: () => IrExpr): IrExpr { return make(); }
function envelope(make: () => { body: IrStmt[]; value: IrExpr }): { body: IrStmt[]; value: IrExpr } {
  return make();
}

// Empty constructors get their storage contract from the return slot,
// including nullable destinations. Separate calls must remain independent.
function typeTable(enabled: boolean): Map<string, IrType> | null {
  return enabled ? new Map() : null;
}
function nameTable(): Set<string> | undefined { return new Set(); }
const types = typeTable(true)!;
const otherTypes = typeTable(true)!;
types.set("number", F64);
types.set("list", { kind: "array", elem: F64 });
if (otherTypes.size !== 0 || typeTable(false) !== null) throw new Error("map construction");
const names = nameTable()!;
names.add("sum.0");
names.add("text.0");
if (names.size !== 2 || nameTable()!.size !== 0) throw new Error("set construction");

const sum = varRef("sum.0", F64, loc);
const text = varRef("text.0", STRING, loc);
const input = argument(0);

// A callback's record return contains another callback's inferred array.
// Both concise and block returns use the declared destination recursively.
const prelude = envelope(() => ({
  body: factory(function () {
    events.push("prelude");
    return [
      { kind: "varDecl", localId: "sum.0", init: input, loc },
      { kind: "varDecl", localId: "text.0", init: { kind: "strLit", value: "context", type: STRING, loc }, loc },
    ];
  }),
  value: input,
}));
if (prelude.value !== input) throw new Error("existing expression identity");
if (prelude.body[0]!.kind !== "varDecl" || prelude.body[1]!.kind !== "varDecl") throw new Error("prelude variants");

// Conditional callback bodies must evaluate just their selected branch.
// Untaken constructors contain effects so eager branch evaluation is visible.
const selected = expressionFactory(() => bound < 0
  ? { kind: "numLit", value: argument(99).kind.length, type: F64, loc }
  : { kind: "bin", op: "+", left: input, right: argument(1), type: F64, loc });
if (selected.kind !== "bin" || selected.left !== input) throw new Error("selected expression");
if (selected.right.kind !== "numLit" || selected.right.value !== 1) throw new Error("selected payload");

// This unannotated callback is the same construction pattern used by the
// frontend's array, Map, Set, and index-signature loop lowerings.
const loop = countedFor(loc, numLit(bound, loc), (index) => [
  {
    kind: "if",
    cond: { kind: "bin", op: ">=", left: index, right: numLit(0, loc), type: BOOL, loc },
    then: factory(() => [
      {
        kind: "assign", localId: "sum.0",
        value: { kind: "bin", op: "+", left: sum, right: arithmetic(false, index), type: F64, loc }, loc,
      },
      {
        kind: "assign", localId: "text.0",
        value: { kind: "strConcat", left: text, right: strLit("!", loc), type: STRING, loc }, loc,
      },
    ]),
    else_: null, loc,
  },
]);

function suffix(enabled: boolean): IrStmt[] {
  return enabled ? [{
    kind: "if", cond: boolLit(true, loc),
    then: [{
      kind: "exprStmt",
      expr: { kind: "intrinsic", name: "console.log", args: [text, sum], type: VOID, loc },
      loc,
    }],
    else_: [], loc,
  }] : [];
}

const body: IrStmt[] = [...prelude.body, loop, ...suffix(true), { kind: "return", value: null, loc }];
if (suffix(false).length !== 0) throw new Error("empty conditional array");
if (loop.kind !== "for" || loop.body[0]!.kind !== "if") throw new Error("loop variants");
if (loop.body[0]!.then.length !== 2 || loop.body[0]!.else_ !== null) throw new Error("loop branches");
if (events.join(",") !== "argument:0,prelude,argument:1") throw new Error(`construction order: ${events.join(",")}`);

const fn: IrFunction = {
  name: "main", params: [], returnType: VOID,
  locals: [
    { id: "i.0", name: "index", type: F64, mutable: true },
    { id: "sum.0", name: "sum", type: F64, mutable: true },
    { id: "text.0", name: "text", type: STRING, mutable: true },
  ],
  body, loc,
};
const module: IrModule = { irVersion: IR_VERSION, sourceFile: loc.file, functions: [fn], entry: "main" };
const roundTripped = deserializeModule(serializeModule(module));
const diagnostics = validateModule(roundTripped);
if (diagnostics.length !== 0) throw new Error(JSON.stringify(diagnostics));
console.log(serializeModule(roundTripped));
