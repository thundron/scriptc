import {
  BOOL,
  F64,
  type IrExpr,
  type IrFunction,
  type IrModule,
  type IrStmt,
} from "../../ir/ir.js";
import { transformStmtList } from "../../ir/traverse.js";
import { observesStacks } from "../stack-observations.js";
import { numericMapPlan, type NumericMapPlan } from "./small-array-maps.js";

/** Fuse only the complete native numeric map implementation into its
 * immediate min/max consumer. The input, its length snapshot, hole tests,
 * callback order and all callback effects remain; the unobservable numeric
 * result array alone disappears. Never stop callbacks after a NaN. */
export function fuseNumericMapReductions(mod: IrModule): IrModule {
  if (process.env["SCRIPTC_NUMERIC_MAP_REDUCTIONS"] === "0" || observesStacks(mod)) return mod;
  const plans = new Map<string, NumericMapPlan>();
  for (const fn of mod.functions) {
    const plan = numericMapPlan(fn, true);
    if (plan) plans.set(fn.name, plan);
  }
  if (!plans.size) return mod;
  const added: IrFunction[] = [],
    helpers = new Map<string, string>();
  const names = new Set(mod.functions.map((fn) => fn.name));
  const reduce = (plan: NumericMapPlan, max: boolean): string => {
    const key = `${plan.fn.name}:${max}`;
    const existing = helpers.get(key);
    if (existing) return existing;
    let name = `%numeric.reduce.${max ? "max" : "min"}.${added.length}`;
    while (names.has(name)) name += ".next";
    names.add(name);
    helpers.set(key, name);
    let id = "%numeric.reduce.acc";
    while (plan.fn.locals.some((local) => local.id === id)) id += ".next";
    const loc = plan.fn.loc;
    const acc = (): IrExpr => ({ kind: "varRef", localId: id, type: F64, loc });
    const mapped = (): IrExpr => ({ kind: "varRef", localId: plan.mapped, type: F64, loc });
    const ordered = (value: () => IrExpr): IrExpr => ({
      kind: "bin",
      op: "===",
      left: value(),
      right: value(),
      type: BOOL,
      loc,
    });
    const assign = (value: IrExpr): IrStmt => ({ kind: "assign", localId: id, value, loc });
    const guard: IrStmt = {
      ...plan.guard,
      then: [
        ...plan.guard.then.slice(0, -1),
        {
          kind: "if",
          cond: ordered(acc),
          then: [
            {
              kind: "if",
              cond: ordered(mapped),
              then: [
                assign({
                  kind: "libCall",
                  fn: max ? "math.max" : "math.min",
                  args: [acc(), mapped()],
                  type: F64,
                  loc,
                }),
              ],
              else_: [assign(mapped())],
              loc,
            },
          ],
          else_: null,
          loc,
        },
      ],
      else_: [
        {
          kind: "if",
          cond: ordered(acc),
          then: [assign({ kind: "numLit", value: NaN, type: F64, loc })],
          else_: null,
          loc,
        },
      ],
    };
    added.push({
      name,
      ...(plan.fn.sourceName !== undefined ? { sourceName: plan.fn.sourceName } : {}),
      params: plan.fn.params,
      returnType: F64,
      locals: [
        ...plan.fn.locals.filter((local) => local.id !== plan.output),
        { id, name: id, type: F64, mutable: true },
      ],
      body: transformStmtList(
        [
          plan.fn.body[0]!,
          {
            kind: "varDecl",
            localId: id,
            init: { kind: "numLit", value: max ? -Infinity : Infinity, type: F64, loc },
            loc,
          },
          { ...plan.loop, body: [guard] },
          { kind: "return", value: acc(), loc },
        ],
        { expr: (e) => ({ ...e }), stmt: (s) => ({ ...s }) },
      ),
      loc,
    });
    return name;
  };
  let changed = false;
  const functions = mod.functions.map((fn) => ({
    ...fn,
    body: transformStmtList(fn.body, {
      stmt: (stmt) => stmt,
      expr: (expr) => {
        if (
          expr.kind !== "libCall" ||
          (expr.fn !== "math.minArr" && expr.fn !== "math.maxArr") ||
          expr.args.length !== 1
        )
          return expr;
        const input = expr.args[0]!;
        if (input.kind !== "call") return expr;
        const plan = plans.get(input.callee);
        if (!plan || input.args.length !== plan.fn.params.length) return expr;
        changed = true;
        return {
          kind: "call",
          callee: reduce(plan, expr.fn === "math.maxArr"),
          args: input.args,
          type: F64,
          loc: expr.loc,
        };
      },
    }),
  }));
  return changed ? { ...mod, functions: [...functions, ...added] } : mod;
}
