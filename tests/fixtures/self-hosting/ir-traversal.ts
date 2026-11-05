import { BOOL, F64, type IrExpr, type IrStmt } from "../../../packages/compiler/src/ir/ir.js";
import { everyExpr, everyStmtList, transformStmtList } from "../../../packages/compiler/src/ir/traverse.js";

const loc = { file: "walk.ts", start: 0, end: 1 };
const num = (value: number): IrExpr => ({ kind: "numLit", value, type: F64, loc });
const statement = (value: number): IrStmt => ({ kind: "exprStmt", expr: num(value), loc });
const body: IrStmt[] = [{ kind: "if", cond: { kind: "boolLit", value: true, type: BOOL, loc }, then: [
  { kind: "exprStmt", expr: { kind: "seqExpr", stmts: [statement(1)], result: num(2), type: F64, loc }, loc },
], else_: [statement(3)], loc }, statement(4)];

for (let pass = 0; pass < 3; pass++) {
  const seen: string[] = [];
  let nested = 0;
  const completed = everyStmtList(body, {
    expr: (node): boolean => {
      if (node.kind === "numLit") {
        const visited = everyExpr(num(9), { expr: (inner): boolean => { nested++; return inner.kind === "numLit"; }, stmt: (): boolean => false });
        if (!visited) throw new Error("nested traversal did not complete");
        seen.push("number:" + node.value);
        return node.value !== 3;
      }
      seen.push(node.kind);
      return true;
    },
    stmt: (node): boolean => { seen.push(node.kind); return true; },
  });
  console.log("walk", pass, completed, nested, seen.join(","));
}

const rewritten = transformStmtList(body, {
  stmt: (node): IrStmt => node,
  expr: (node): IrExpr => {
    if (node.kind !== "numLit" || node.value !== 2) return node;
    const nested = transformStmtList([statement(5)], { stmt: (inner): IrStmt => inner, expr: (inner): IrExpr => inner.kind === "numLit" ? num(inner.value + 1) : inner });
    return { kind: "seqExpr", stmts: nested, result: num(20), type: F64, loc };
  },
});
for (const tree of [body, rewritten]) {
  const values: number[] = [];
  everyStmtList(tree, { stmt: (): boolean => true, expr: (node): boolean => { if (node.kind === "numLit") values.push(node.value); return true; } });
  console.log("values", values.join(","));
}
