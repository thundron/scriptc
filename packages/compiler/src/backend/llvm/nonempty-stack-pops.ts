import type { IrExpr, IrModule, IrStmt } from "../../ir/ir.js";
import { children, type Node } from "./region-ir.js";

type Pop = IrExpr & { kind: "arrIntrinsic" };
const ref = (node: IrExpr, id: string): boolean => node.kind === "varRef" && node.localId === id;
function gcd(a: number, b: number): number {
  while (b) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a;
}

/** A complete run of pops can only lose its partial state by throwing out
 * of this frame. One-argument wrappers receive the scalar optional value,
 * never the private stack. No catch/finally or suspension is admitted. */
function initializerPop(stmt: IrStmt, id: string): Pop | null {
  if (stmt.kind !== "varDecl" || !stmt.init) return null;
  let expr = stmt.init;
  while (expr.kind === "call" && expr.args.length === 1) expr = expr.args[0]!;
  while (expr.kind === "unionNarrow") expr = expr.value;
  return expr.kind === "arrIntrinsic" &&
    expr.method === "pop" &&
    expr.args.length === 0 &&
    ref(expr.receiver, id)
    ? expr
    : null;
}

/** Private push/pop-only arrays have a length congruence: an initial length
 * and all complete push/pop batches divisible by k keep length divisible
 * by k. A positive loop guard then proves at least k elements. Sparse or
 * non-value storage still takes the ordinary packed-pop runtime fallback. */
export function findNonemptyStackPops(mod: IrModule): ReadonlySet<IrExpr> {
  const proven = new Set<IrExpr>(),
    globals = new Set((mod.globals ?? []).map((global) => global.id));
  for (const fn of mod.functions) {
    if (fn.async || fn.generator) continue;
    let catches = false;
    const scan = (
      node: Node,
      visit: (node: Node, parent: Node | null) => void,
      parent: Node | null = null,
    ): void => {
      visit(node, parent);
      const kids: Node[] = [];
      children(node, kids);
      for (const child of kids) scan(child, visit, node);
    };
    for (const stmt of fn.body)
      scan(stmt, (node) => {
        if (node.kind === "tryCatch") catches = true;
      });
    if (catches) continue;
    let candidates = 0;
    for (const declaration of fn.body) {
      if (
        declaration.kind !== "varDecl" ||
        declaration.init?.kind !== "arrayLit" ||
        declaration.init.spreads?.length ||
        declaration.init.type.kind !== "array" ||
        declaration.init.type.elem.kind !== "f64"
      )
        continue;
      const id = declaration.localId,
        local = fn.locals.find((local) => local.id === id);
      if (
        !local ||
        local.boxed ||
        local.tdz ||
        globals.has(id) ||
        fn.params.some((param) => param.localId === id) ||
        fn.captures?.some((param) => param.localId === id)
      )
        continue;
      if (++candidates > 32) break;
      let valid = true,
        modulus = declaration.init.elems.length,
        declarations = 0;
      const pops = new Set<IrExpr>(),
        grouped = new Set<IrExpr>();
      for (const stmt of fn.body)
        scan(stmt, (node, parent) => {
          if (node.kind === "varDecl" && node.localId === id) declarations++;
          if (
            (node.kind === "assign" || node.kind === "assignExpr" || node.kind === "incDec") &&
            node.localId === id
          )
            valid = false;
          if (node.kind !== "varRef" || node.localId !== id) return;
          if (parent?.kind !== "arrIntrinsic" || parent.receiver !== node) {
            valid = false;
            return;
          }
          if (parent.method === "push") modulus = gcd(modulus, parent.args.length);
          else if (parent.method === "pop" && !parent.args.length) {
            if (pops.has(parent)) valid = false;
            pops.add(parent);
          } else if (parent.method !== "length" || parent.args.length) valid = false;
        });
      if (!valid || declarations !== 1 || !pops.size) continue;
      const groups = (list: IrStmt[]): void => {
        for (let i = 0; i < list.length;) {
          const first = initializerPop(list[i]!, id);
          if (!first) {
            i++;
            continue;
          }
          let count = 0;
          while (i < list.length) {
            const pop = initializerPop(list[i]!, id);
            if (!pop) break;
            grouped.add(pop);
            count++;
            i++;
          }
          modulus = gcd(modulus, count);
        }
      };
      groups(fn.body);
      for (const stmt of fn.body)
        scan(stmt, (node) => {
          if (node.kind === "if") {
            groups(node.then);
            if (node.else_) groups(node.else_);
          } else if (
            node.kind === "while" ||
            node.kind === "doWhile" ||
            node.kind === "for" ||
            node.kind === "forOf" ||
            node.kind === "block"
          )
            groups(node.body);
          else if (node.kind === "switch") for (const arm of node.cases) groups(arm.body);
        });
      if (!modulus || pops.size !== grouped.size) continue;
      const length = (expr: IrExpr): boolean =>
        expr.kind === "arrIntrinsic" &&
        expr.method === "length" &&
        !expr.args.length &&
        ref(expr.receiver, id);
      const minimum = (expr: IrExpr): number => {
        if (expr.kind === "toBool" && length(expr.operand)) return 1;
        if (expr.kind !== "bin") return 0;
        if (length(expr.left) && expr.right.kind === "numLit") {
          const n = expr.right.value;
          if (!Number.isFinite(n)) return 0;
          if (expr.op === ">" && n >= 0) return Math.floor(n) + 1;
          if (expr.op === ">=" && n > 0) return Math.ceil(n);
          if (expr.op === "!==" && n === 0) return 1;
          if (expr.op === "===" && Number.isInteger(n) && n > 0) return n;
        }
        if (length(expr.right) && expr.left.kind === "numLit") {
          const n = expr.left.value;
          if (!Number.isFinite(n)) return 0;
          if (expr.op === "<" && n >= 0) return Math.floor(n) + 1;
          if (expr.op === "<=" && n > 0) return Math.ceil(n);
        }
        return 0;
      };
      for (const stmt of fn.body)
        scan(stmt, (node) => {
          if (node.kind !== "while") return;
          let remaining = Math.ceil(minimum(node.cond) / modulus) * modulus;
          if (remaining <= 0) return;
          for (const statement of node.body) {
            const pop = initializerPop(statement, id);
            if (pop) {
              if (remaining > 0) {
                proven.add(pop);
                remaining--;
              }
              continue;
            }
            // A nested branch/loop may have drained the stack. Pushes cannot
            // reduce it; unmatched pops already rejected the entire candidate.
            scan(statement, (child) => {
              if (child.kind === "arrIntrinsic" && pops.has(child)) remaining = 0;
            });
          }
        });
    }
  }
  return proven;
}
