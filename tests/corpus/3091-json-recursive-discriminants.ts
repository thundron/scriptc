export {};

type Expr = { kind: "number"; value: number } | { kind: "add"; left: Expr; right: Expr } | { kind: "unit" };
type Statement =
  | { kind: "empty" }
  | { kind: "value"; expression: Expr }
  | { kind: "block"; body: Statement[] }
  | { kind: "loop"; body: Statement[]; init: Statement | null; update: Statement | null; condition: Expr | null };
interface Program { body: Statement[]; optional?: Statement }
function expression(expr: Expr): number {
  switch (expr.kind) {
    case "number": return expr.value;
    case "unit": return 0;
    case "add": return expression(expr.left) + expression(expr.right);
  }
}
function statement(stmt: Statement): number {
  switch (stmt.kind) {
    case "empty": return 0;
    case "value": return expression(stmt.expression);
    case "block": {
      let total = 0;
      for (const child of stmt.body) total += statement(child);
      return total;
    }
    case "loop": {
      let total = 0;
      if (stmt.init) total += statement(stmt.init);
      if (stmt.condition) total += expression(stmt.condition);
      for (const child of stmt.body) total += statement(child);
      if (stmt.update) total += statement(stmt.update);
      return total;
    }
  }
}
const source = '{"body":[{"kind":"empty"},{"kind":"loop","body":[{"kind":"block","body":[{"kind":"value","expression":{"kind":"add","left":{"kind":"number","value":3},"right":{"kind":"number","value":4}}}]}],"init":{"kind":"value","expression":{"kind":"number","value":2}},"condition":{"kind":"unit"},"update":{"kind":"value","expression":{"kind":"number","value":5}}}]}';
const program = JSON.parse(source) as Program;
let total = 0;
for (const stmt of program.body) total += statement(stmt);
console.log("recursive", total, program.optional === undefined);
const roundtrip = JSON.parse(JSON.stringify(program)) as Program;
console.log("roundtrip", statement(roundtrip.body[1]!));

// Independently parsed trees exercise recursive helper reuse and release.
for (let i = 0; i < 30; i++) {
  const again = JSON.parse(source) as Program;
  total += statement(again.body[1]!);
}
console.log("repeated", total);
