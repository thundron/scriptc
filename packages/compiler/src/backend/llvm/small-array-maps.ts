import {
  F64,
  type IrExpr,
  type IrFunction,
  type IrLocal,
  type IrModule,
  type IrStmt,
} from "../../ir/ir.js";
import { transformExpr, transformStmtList } from "../../ir/traverse.js";
import { observesStacks } from "../stack-observations.js";
const ref = (e: IrExpr, id: string): boolean => e.kind === "varRef" && e.localId === id;
const num = (e: IrExpr, n: number): boolean => e.kind === "numLit" && e.value === n;
const MAP_EXPRESSIONS = new Set([
  "varRef",
  "numLit",
  "strLit",
  "boolLit",
  "unitLit",
  "bin",
  "unary",
  "libCall",
  "call",
  "callValue",
  "fieldGet",
  "recordGet",
  "arrayGet",
  "arrIntrinsic",
  "bytesIntrinsic",
  "unionNarrow",
  "ternary",
  "logical",
  "nullish",
  "strCmp",
  "unionTag",
]);
export interface NumericMapPlan {
  fn: IrFunction;
  array: string;
  index: string;
  value: string | null;
  expression: IrExpr;
  output: string;
  mapped: string;
  loop: IrStmt & { kind: "for" };
  guard: IrStmt & { kind: "if" };
}

/** Match the entire packed numeric map loop, including an inlined callback.
 * A callback observing the input object cannot pass this proof. */
export function numericMapPlan(fn: IrFunction, retainInput = false): NumericMapPlan | null {
  if (
    fn.async ||
    fn.generator ||
    fn.captures?.length ||
    fn.classCaptures?.length ||
    !fn.params.length ||
    fn.body.length !== 6 ||
    fn.returnType.kind !== "array" ||
    fn.returnType.elem.kind !== "f64"
  )
    return null;
  const array = fn.params[0]!;
  if (array.type.kind !== "array" || (!retainInput && array.type.elem.kind !== "f64")) return null;
  const [length, out, reserve, loop, finish, result] = fn.body;
  if (
    length!.kind !== "varDecl" ||
    length!.init?.kind !== "arrIntrinsic" ||
    length!.init.method !== "length" ||
    !ref(length!.init.receiver, array.localId) ||
    length!.init.args.length
  )
    return null;
  if (
    out!.kind !== "varDecl" ||
    out!.init?.kind !== "arrayLit" ||
    out!.init.elems.length ||
    (out!.init.spreads?.length ?? 0)
  )
    return null;
  const size = (e: IrExpr): boolean =>
    ref(e, length!.localId) ||
    (e.kind === "ternary" &&
      e.cond.kind === "bin" &&
      e.cond.op === "<" &&
      num(e.cond.left, 0) &&
      ref(e.cond.right, length!.localId) &&
      e.then.kind === "bin" &&
      e.then.op === "-" &&
      ref(e.then.left, length!.localId) &&
      num(e.then.right, 0) &&
      num(e.else_, 0));
  if (
    reserve!.kind !== "arraySetLength" ||
    !reserve!.reserve ||
    !ref(reserve!.arr, out!.localId) ||
    !size(reserve!.length)
  )
    return null;
  if (
    loop!.kind !== "for" ||
    loop!.init?.kind !== "varDecl" ||
    !loop!.init.init ||
    !num(loop!.init.init, 0) ||
    loop!.cond?.kind !== "bin" ||
    loop!.cond.op !== "<" ||
    !ref(loop!.cond.left, loop!.init.localId) ||
    !ref(loop!.cond.right, length!.localId)
  )
    return null;
  const index = loop!.init.localId;
  if (
    loop!.update?.kind !== "assign" ||
    loop!.update.localId !== index ||
    loop!.update.value.kind !== "bin" ||
    loop!.update.value.op !== "+" ||
    !ref(loop!.update.value.left, index) ||
    !num(loop!.update.value.right, 1) ||
    loop!.body.length !== 1
  )
    return null;
  const guard = loop!.body[0]!;
  if (
    guard.kind !== "if" ||
    guard.else_ !== null ||
    guard.cond.kind !== "arrayHas" ||
    !ref(guard.cond.arr, array.localId) ||
    !ref(guard.cond.index, index) ||
    (guard.then.length !== 2 && guard.then.length !== 3)
  )
    return null;
  const read = (e: IrExpr): boolean =>
    e.kind === "arrayGet" && ref(e.arr, array.localId) && ref(e.index, index);
  let value: string | null = null;
  if (guard.then.length === 3) {
    const first = guard.then[0]!;
    if (first.kind !== "varDecl" || !first.init || !read(first.init)) return null;
    value = first.localId;
  }
  const mapped = guard.then[guard.then.length - 2]!,
    store = guard.then[guard.then.length - 1]!;
  if (
    mapped.kind !== "varDecl" ||
    !mapped.init ||
    mapped.init.type.kind !== "f64" ||
    store.kind !== "arraySet" ||
    !ref(store.arr, out!.localId) ||
    !ref(store.index, index) ||
    !ref(store.value, mapped.localId)
  )
    return null;
  if (
    finish!.kind !== "arraySetLength" ||
    finish!.reserve ||
    !ref(finish!.arr, out!.localId) ||
    !size(finish!.length) ||
    result!.kind !== "return" ||
    !result!.value ||
    !ref(result!.value, out!.localId)
  )
    return null;
  const parameters = new Set(fn.params.slice(1).map((p) => p.localId)),
    locals = new Set(fn.locals.map((l) => l.id));
  let valid = true,
    nodes = 0;
  // The sole input read is replaced as a unit; no other input reference,
  // local rebinding, or capture can survive into the caller's frame.
  const inspect = (e: IrExpr): IrExpr => {
    if (++nodes > 256) {
      valid = false;
      return { kind: "numLit", value: 0, type: F64, loc: e.loc };
    }
    if (!MAP_EXPRESSIONS.has(e.kind)) valid = false;
    if (read(e)) return { kind: "numLit", value: 0, type: F64, loc: e.loc };
    if (
      e.kind === "assignExpr" ||
      e.kind === "incDec" ||
      e.kind === "closure" ||
      e.kind === "classRef" ||
      e.kind === "seqExpr"
    )
      valid = false;
    if (
      e.kind === "varRef" &&
      ((e.localId === array.localId && !retainInput) ||
        (locals.has(e.localId) &&
          !parameters.has(e.localId) &&
          e.localId !== index &&
          e.localId !== value))
    )
      valid = false;
    return e;
  };
  transformExpr(mapped.init, { expr: inspect, stmt: (s) => s });
  return valid
    ? {
        fn,
        array: array.localId,
        index,
        value,
        expression: mapped.init,
        output: out!.localId,
        mapped: mapped.localId,
        loop: loop!,
        guard,
      }
    : null;
}

export function specializeSmallArrayMaps(mod: IrModule): IrModule {
  const plans = new Map<string, NumericMapPlan>();
  for (const fn of mod.functions) {
    const p = numericMapPlan(fn);
    if (p) plans.set(fn.name, p);
  }
  if (!plans.size || observesStacks(mod)) return mod;
  let changed = false;
  const functions = mod.functions.map((fn) => {
    if (fn.async || fn.generator) return fn;
    const added: IrLocal[] = [],
      ids = new Set([
        ...fn.locals.map((l) => l.id),
        ...fn.params.map((p) => p.localId),
        ...(mod.globals ?? []).map((g) => g.id),
      ]);
    let serial = 0;
    const hold = (value: IrExpr, stmts: IrStmt[]): IrExpr => {
      let id: string;
      do {
        id = `%small.map.${serial++}`;
      } while (ids.has(id));
      ids.add(id);
      added.push({ id, name: id, type: value.type, mutable: false });
      stmts.push({ kind: "varDecl", localId: id, init: value, loc: value.loc });
      return { kind: "varRef", localId: id, type: value.type, loc: value.loc };
    };
    const body = transformStmtList(fn.body, {
      stmt: (s) => s,
      expr: (e) => {
        if (e.kind !== "call") return e;
        const p = plans.get(e.callee),
          input = e.args[0];
        if (
          !p ||
          e.args.length !== p.fn.params.length ||
          input?.kind !== "arrayLit" ||
          input.type.kind !== "array" ||
          input.type.elem.kind !== "f64" ||
          !input.elems.length ||
          input.elems.length > 16 ||
          (input.spreads?.length ?? 0) ||
          input.elems.some((x) => x.type.kind !== "f64")
        )
          return e;
        const stmts: IrStmt[] = [],
          values = input.elems.map((value) => hold(value, stmts)),
          parameters = new Map<string, IrExpr>();
        e.args
          .slice(1)
          .forEach((value, i) => parameters.set(p.fn.params[i + 1]!.localId, hold(value, stmts)));
        const elems = values.map((value, i) =>
          transformExpr(p.expression, {
            stmt: (s) => s,
            expr: (x) => {
              if (x.kind === "arrayGet" && ref(x.arr, p.array) && ref(x.index, p.index))
                return value;
              if (x.kind === "varRef") {
                if (x.localId === p.value) return value;
                if (x.localId === p.index)
                  return { kind: "numLit", value: i, type: F64, loc: x.loc };
                return parameters.get(x.localId) ?? x;
              }
              return x;
            },
          }),
        );
        return {
          kind: "seqExpr",
          stmts,
          result: { kind: "arrayLit", elems, type: e.type, loc: e.loc },
          type: e.type,
          loc: e.loc,
        };
      },
    });
    if (!added.length) return fn;
    changed = true;
    return { ...fn, locals: [...fn.locals, ...added], body };
  });
  return changed ? { ...mod, functions } : mod;
}
