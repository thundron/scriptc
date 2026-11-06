import type { IrExpr, IrFunction } from "../../ir/ir.js";
import { everyStmtList } from "../../ir/traverse.js";

/** Values exactly representable in binary32, including NaN and both zeros.
 * These are value facts, not a permission to round arbitrary arithmetic. */
export class Float32Values {
  private readonly sources = new Map<string, ReadonlyMap<string, IrExpr>>();

  constructor(
    private readonly functions: ReadonlyMap<string, IrFunction>,
    private readonly optionalRead: (expr: IrExpr) => boolean,
  ) {}

  isValue(expr: IrExpr, fn: string, visiting = new Set<string>()): boolean {
    if (expr.type.kind !== "f64" || visiting.size >= 64) return false;
    if (expr.kind === "unionNarrow" && this.optionalRead(expr.value)) return true;
    if (expr.kind === "numLit") return Object.is(Math.fround(expr.value), expr.value);
    if (expr.kind === "bytesIntrinsic")
      return (
        expr.method === "get" &&
        expr.receiver.type.kind === "bytes" &&
        (expr.receiver.type.elem === "f32" || expr.receiver.type.elem === "f16")
      );
    if (expr.kind === "libCall") {
      if (
        expr.fn === "math.fround" ||
        expr.fn === "math.f16round" ||
        expr.fn.startsWith("math.f32")
      )
        return true;
      return (
        (expr.fn === "math.min" || expr.fn === "math.max") &&
        expr.args.every((argument) => this.isValue(argument, fn, visiting))
      );
    }
    if (expr.kind === "unary" && expr.op === "-") return this.isValue(expr.operand, fn, visiting);
    if (expr.kind === "ternary")
      return this.isValue(expr.then, fn, visiting) && this.isValue(expr.else_, fn, visiting);
    if (expr.kind !== "varRef" || visiting.has(expr.localId)) return false;
    const source = this.locals(fn).get(expr.localId);
    if (!source) return false;
    visiting.add(expr.localId);
    const result = this.isValue(source, fn, visiting);
    visiting.delete(expr.localId);
    return result;
  }

  private locals(name: string): ReadonlyMap<string, IrExpr> {
    const cached = this.sources.get(name);
    if (cached) return cached;
    const sources = new Map<string, IrExpr>();
    const fn = this.functions.get(name);
    if (fn) {
      const eligible = new Set(
        fn.locals
          .filter((local) => local.type.kind === "f64" && !local.mutable && !local.boxed)
          .map((local) => local.id),
      );
      const invalid = new Set<string>();
      everyStmtList(fn.body, {
        expr: (expr) => {
          if (expr.kind === "assignExpr" || expr.kind === "incDec") invalid.add(expr.localId);
          return true;
        },
        stmt: (stmt) => {
          if (stmt.kind === "varDecl") {
            if (sources.has(stmt.localId)) invalid.add(stmt.localId);
            if (stmt.init && eligible.has(stmt.localId)) sources.set(stmt.localId, stmt.init);
          } else if (stmt.kind === "assign" || stmt.kind === "forOf") invalid.add(stmt.localId);
          else if (stmt.kind === "tryCatch" && stmt.catchLocalId !== null)
            invalid.add(stmt.catchLocalId);
          return true;
        },
      });
      for (const id of invalid) sources.delete(id);
    }
    this.sources.set(name, sources);
    return sources;
  }
}
