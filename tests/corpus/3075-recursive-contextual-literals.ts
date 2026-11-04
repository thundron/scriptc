export {};

type Expr =
  | { kind: "number"; value: number }
  | { kind: "binary"; left: Expr; right: Expr }
  | { kind: "call"; args: Expr[] };
type Stmt =
  | { kind: "stop" }
  | { kind: "expr"; value: Expr }
  | { kind: "if"; cond: Expr; then: Stmt[]; else_: Stmt[] | null }
  | { kind: "block"; body: Stmt[] };

// Choosing a contextual arm by its prematurely mapped field layouts
// can reject the recursive arm and select the smaller `stop` shape.
// Observe every payload, not just the discriminant or array length.
const program: Stmt[] = [
  {
    kind: "if", cond: { kind: "number", value: 1 },
    then: [
      { kind: "expr", value: { kind: "call", args: [{ kind: "number", value: 2 }] } },
      { kind: "block", body: [] },
    ],
    else_: [{ kind: "stop" }],
  },
  {
    kind: "block", body: [
      { kind: "expr", value: { kind: "binary", left: { kind: "number", value: 3 }, right: { kind: "number", value: 4 } } },
      { kind: "if", cond: { kind: "number", value: 0 }, then: [], else_: null },
    ],
  },
];

function evaluate(expr: Expr): number {
  switch (expr.kind) {
    case "number": return expr.value;
    case "binary": return evaluate(expr.left) + evaluate(expr.right);
    case "call": return expr.args.reduce((sum, arg) => sum + evaluate(arg), 0);
  }
}
function walk(stmts: Stmt[]): number {
  let sum = 0;
  for (const stmt of stmts) {
    switch (stmt.kind) {
      case "stop": console.log("stop"); break;
      case "expr": sum += evaluate(stmt.value); break;
      case "if":
        console.log("if", evaluate(stmt.cond), stmt.then.length, stmt.else_?.length ?? -1);
        sum += walk(stmt.then);
        if (stmt.else_) sum += walk(stmt.else_);
        break;
      case "block": sum += walk(stmt.body); break;
    }
  }
  return sum;
}
console.log("sum", walk(program));
console.log(JSON.stringify(program));

// Fresh nested arrays construct their elements at the selected arm's
// destination type. Empty and nonempty siblings must share the same ABI.
type Table = { kind: "table"; rows: Expr[][] } | { kind: "empty" };
function table(): Table {
  return { kind: "table", rows: [[], [{ kind: "number", value: 8 }], [{ kind: "call", args: [] }]] };
}
const built = table();
if (built.kind === "table") {
  built.rows[0]!.push({ kind: "binary", left: { kind: "number", value: 5 }, right: { kind: "number", value: 6 } });
  console.log(built.rows.map((row) => row.reduce((sum, expr) => sum + evaluate(expr), 0)).join(","));
}

// Shorthand fields and narrow intersections also select the recursive
// member semantically; their inferred shapes need not be the final layout.
type Conditional = Stmt & { kind: "if" };
function conditional(cond: Expr): Conditional {
  const then: Stmt[] = [{ kind: "expr", value: cond }];
  return { kind: "if", cond, then, else_: null };
}
console.log("conditional", walk([conditional({ kind: "number", value: 9 })]));

// Number and boolean discriminants must survive the same arm selection.
type Tagged =
  | { kind: 0; enabled: false }
  | { kind: 1; enabled: true; children: Stmt[] };
function tagged(): Tagged {
  return { kind: 1, enabled: true, children: [{ kind: "block", body: [{ kind: "stop" }] }] };
}
const selected = tagged();
if (selected.kind === 1) console.log(selected.enabled, walk(selected.children));

// Literal construction remains ordered and evaluates each field once.
let visits = "";
function field(label: string): Expr {
  visits += label;
  return { kind: "number", value: visits.length };
}
const ordered: Expr = { kind: "binary", left: field("L"), right: field("R") };
console.log("order", visits, evaluate(ordered));
