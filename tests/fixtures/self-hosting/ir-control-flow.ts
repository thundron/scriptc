import { alwaysReturns, containsBreak } from "../../../packages/compiler/src/ir/control-flow.js";
import { boolLit, numLit, strLit, varRef } from "../../../packages/compiler/src/ir/build.js";
import { BOOL, STRING, VOID, type IrStmt, type IrUnionDef, type SrcLoc } from "../../../packages/compiler/src/ir/ir.js";

const loc: SrcLoc = { file: "control-flow.ts", start: 0, end: 1 };
const unions = new Map<string, IrUnionDef>([
  ["variants", { id: "variants", arms: [{ kind: "record", shapeId: "left" }, { kind: "record", shapeId: "right" }] }],
]);
const ret: IrStmt = { kind: "return", value: numLit(1, loc), loc };
const stop: IrStmt = { kind: "break", loc };
const next: IrStmt = { kind: "continue", loc };
const thrown: IrStmt = { kind: "throw", value: strLit("error", loc), loc };
const empty: IrStmt = { kind: "block", body: [], loc };
const cases: { name: string; body: IrStmt[]; returns: boolean; breaks: boolean }[] = [
  { name: "empty", body: [], returns: false, breaks: false },
  { name: "return", body: [ret], returns: true, breaks: false },
  { name: "throw", body: [thrown], returns: true, breaks: false },
  { name: "break", body: [stop], returns: false, breaks: true },
  { name: "continue", body: [next], returns: false, breaks: false },
  { name: "sequence", body: [empty, ret], returns: true, breaks: false },
  {
    name: "both branches", body: [{ kind: "if", cond: varRef("condition", BOOL, loc), then: [ret], else_: [thrown], loc }],
    returns: true, breaks: false,
  },
  {
    name: "one branch", body: [{ kind: "if", cond: varRef("condition", BOOL, loc), then: [ret], else_: null, loc }],
    returns: false, breaks: false,
  },
  {
    name: "branch break", body: [{ kind: "if", cond: varRef("condition", BOOL, loc), then: [stop], else_: [ret], loc }],
    returns: false, breaks: true,
  },
  {
    name: "infinite while", body: [{ kind: "while", cond: boolLit(true, loc), body: [next], loc }],
    returns: true, breaks: false,
  },
  {
    name: "conditional while", body: [{ kind: "while", cond: varRef("condition", BOOL, loc), body: [ret], loc }],
    returns: false, breaks: false,
  },
  {
    name: "escaping while", body: [{ kind: "while", cond: boolLit(true, loc), body: [stop], loc }],
    returns: false, breaks: false,
  },
  {
    name: "infinite for", body: [{ kind: "for", init: null, cond: null, update: null, body: [empty], loc }],
    returns: true, breaks: false,
  },
  {
    name: "escaping for", body: [{ kind: "for", init: null, cond: boolLit(true, loc), update: null, body: [stop], loc }],
    returns: false, breaks: false,
  },
  {
    name: "do return", body: [{ kind: "doWhile", body: [ret], cond: boolLit(false, loc), loc }],
    returns: true, breaks: false,
  },
  {
    name: "do break", body: [{ kind: "doWhile", body: [stop], cond: boolLit(true, loc), loc }],
    returns: false, breaks: false,
  },
  {
    name: "try return", body: [{ kind: "tryCatch", tryBody: [ret], catchBody: null, catchLocalId: null, finallyBody: [empty], loc }],
    returns: true, breaks: false,
  },
  {
    name: "caught fallthrough", body: [{ kind: "tryCatch", tryBody: [thrown], catchBody: [empty], catchLocalId: "error", finallyBody: null, loc }],
    returns: false, breaks: false,
  },
  {
    name: "caught return", body: [{ kind: "tryCatch", tryBody: [thrown], catchBody: [ret], catchLocalId: "error", finallyBody: null, loc }],
    returns: true, breaks: false,
  },
  {
    name: "finally throw", body: [{ kind: "tryCatch", tryBody: [empty], catchBody: null, catchLocalId: null, finallyBody: [thrown], loc }],
    returns: true, breaks: false,
  },
  {
    name: "caught break", body: [{ kind: "tryCatch", tryBody: [empty], catchBody: [stop], catchLocalId: "error", finallyBody: null, loc }],
    returns: false, breaks: true,
  },
  {
    name: "exit", body: [{ kind: "exprStmt", expr: { kind: "libCall", fn: "process.exit", args: [numLit(0, loc)], type: VOID, loc }, loc }],
    returns: true, breaks: false,
  },
  {
    name: "default switch", body: [{ kind: "switch", disc: numLit(1, loc), cases: [{ test: numLit(1, loc), body: [] }, { test: null, body: [ret] }], loc }],
    returns: true, breaks: false,
  },
  {
    name: "missing default", body: [{ kind: "switch", disc: numLit(1, loc), cases: [{ test: numLit(1, loc), body: [ret] }], loc }],
    returns: false, breaks: false,
  },
  {
    name: "default break", body: [{ kind: "switch", disc: numLit(1, loc), cases: [{ test: null, body: [stop] }], loc }],
    returns: false, breaks: false,
  },
  {
    name: "exhaustive switch", body: [{
      kind: "switch",
      disc: { kind: "unionDisc", unionId: "variants", value: varRef("variant", { kind: "union", unionId: "variants" }, loc), field: "kind", type: STRING, loc },
      cases: [{ test: strLit("left", loc), body: [ret] }, { test: strLit("right", loc), body: [thrown] }], loc,
    }], returns: true, breaks: false,
  },
  {
    name: "duplicate switch", body: [{
      kind: "switch",
      disc: { kind: "unionDisc", unionId: "variants", value: varRef("variant", { kind: "union", unionId: "variants" }, loc), field: "kind", type: STRING, loc },
      cases: [{ test: strLit("left", loc), body: [ret] }, { test: strLit("left", loc), body: [ret] }], loc,
    }], returns: false, breaks: false,
  },
];

for (const entry of cases) {
  const returns = alwaysReturns(entry.body, unions);
  const breaks = containsBreak(entry.body);
  if (returns !== entry.returns || breaks !== entry.breaks) throw new Error("analysis mismatch: " + entry.name);
  console.log(entry.name, returns, breaks);
}

// Build several recursive depths at runtime: the executable traverses the
// real statement union instead of constant-folding a literal result table.
for (const depth of [0, 1, 4, 12]) {
  let body: IrStmt[] = [ret];
  for (let i = 0; i < depth; i++) {
    body = [{ kind: "if", cond: varRef("condition", BOOL, loc), then: body, else_: [{ kind: "block", body, loc }], loc }];
  }
  console.log("depth", depth, alwaysReturns(body, unions), containsBreak(body));
}
