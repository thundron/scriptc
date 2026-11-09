import {
  BOOL,
  F64,
  type IrExpr,
  type IrFunction,
  type IrLocal,
  type IrModule,
  type IrStmt,
} from "../../ir/ir.js";
import { everyStmtList, transformStmtList } from "../../ir/traverse.js";
import { OptionalArrayReads } from "./local-array-reads.js";

type Literal = IrExpr & { kind: "arrayLit" };
interface Candidate {
  literal: Literal;
  initializer: IrExpr;
  prefix: IrStmt[];
  owner: IrStmt[];
  position: number;
  slots: IrLocal[];
}

/** Scalar-replace small numeric literals with numeric reads and fixed-slot writes.
 * The declaration must dominate every use; capture, identity, aliasing,
 * unbounded mutation and unknown consumers keep the ordinary array. */
export function scalarizeArrayLiterals(mod: IrModule): IrModule {
  const eligible = (fn: IrFunction): boolean =>
    !fn.async &&
    !fn.generator &&
    fn.locals.some(
      (local) => !local.boxed && local.type.kind === "array" && local.type.elem.kind === "f64",
    );
  if (!mod.functions.some(eligible)) return mod;
  const globals = new Set((mod.globals ?? []).map((global) => global.id));
  const reads = new OptionalArrayReads(
    new Map(mod.functions.map((fn) => [fn.name, fn])),
    new Map((mod.unions ?? []).map((union) => [union.id, union])),
  );
  let changed = false;
  const functions = mod.functions.map((fn) => {
    const result = eligible(fn) ? scalarize(fn, reads, globals) : fn;
    changed ||= result !== fn;
    return result;
  });
  return changed ? { ...mod, functions } : mod;
}

function scalarize(
  fn: IrFunction,
  reads: OptionalArrayReads,
  globals: ReadonlySet<string>,
): IrFunction {
  if (fn.async || fn.generator) return fn;
  const candidates = new Map<string, Candidate>();
  // Parameters may be observed through mapped arguments; captures and
  // module bindings have readers outside this function's statement tree.
  const nonlocal = new Set([
    ...fn.params.map((param) => param.localId),
    ...(fn.captures ?? []).map((capture) => capture.localId),
  ]);
  const locals = new Map(fn.locals.map((local) => [local.id, local]));
  // A declaration dominates later statements in its own statement list,
  // including their nested bodies, but not sibling branches or finally.
  const lists: IrStmt[][] = [fn.body];
  everyStmtList(fn.body, {
    stmt: (stmt) => {
      switch (stmt.kind) {
        case "block":
        case "for":
        case "while":
        case "doWhile":
        case "forOf":
          lists.push(stmt.body);
          break;
        case "if":
          lists.push(stmt.then);
          if (stmt.else_) lists.push(stmt.else_);
          break;
        case "switch":
          for (const arm of stmt.cases) lists.push(arm.body);
          break;
        case "tryCatch":
          lists.push(stmt.tryBody);
          if (stmt.catchBody) lists.push(stmt.catchBody);
          if (stmt.finallyBody) lists.push(stmt.finallyBody);
          break;
      }
      return true;
    },
    expr: () => true,
  });
  for (const owner of lists)
    for (let position = 0; position < owner.length && candidates.size < 16; position++) {
      const stmt = owner[position]!;
      if (stmt.kind !== "varDecl" || !stmt.init) continue;
      const init = stmt.init.kind === "seqExpr" ? stmt.init.result : stmt.init,
        local = locals.get(stmt.localId);
      if (init.kind !== "arrayLit") continue;
      if (
        !local ||
        globals.has(stmt.localId) ||
        nonlocal.has(stmt.localId) ||
        local.boxed ||
        local.tdz ||
        init.type.kind !== "array" ||
        init.type.elem.kind !== "f64" ||
        init.elems.length > 16 ||
        (init.spreads?.length ?? 0) !== 0 ||
        init.elems.some((elem) => elem.type.kind !== "f64")
      )
        continue;
      candidates.set(stmt.localId, {
        literal: init,
        initializer: stmt.init,
        prefix: stmt.init.kind === "seqExpr" ? stmt.init.stmts : [],
        owner,
        position,
        slots: [],
      });
    }
  if (!candidates.size) return fn;
  const allowed = new Map<string, number>(),
    observed = new Map<string, number>(),
    rejected = new Set<string>();
  const declared = new Map<string, number>();
  const allow = (expr: IrExpr): void => {
    if (expr.kind === "varRef") allowed.set(expr.localId, (allowed.get(expr.localId) ?? 0) + 1);
  };
  const candidate = (expr: IrExpr): Candidate | undefined =>
    expr.kind === "varRef" ? candidates.get(expr.localId) : undefined;
  everyStmtList(fn.body, {
    stmt: (stmt) => {
      if (stmt.kind === "assign") rejected.add(stmt.localId);
      if (stmt.kind === "varDecl")
        declared.set(stmt.localId, (declared.get(stmt.localId) ?? 0) + 1);
      if (stmt.kind === "arraySet") {
        const c = candidate(stmt.arr);
        if (
          c &&
          stmt.value.type.kind === "f64" &&
          stmt.index.kind === "numLit" &&
          Number.isInteger(stmt.index.value) &&
          stmt.index.value >= 0 &&
          stmt.index.value < c.literal.elems.length
        )
          allow(stmt.arr);
      }
      if (
        stmt.kind === "varDecl" &&
        candidates.has(stmt.localId) &&
        stmt.init !== candidates.get(stmt.localId)!.initializer
      )
        rejected.add(stmt.localId);
      return true;
    },
    expr: (expr) => {
      if (expr.kind === "assignExpr" || expr.kind === "incDec") rejected.add(expr.localId);
      if (expr.kind === "closure" || expr.kind === "classRef")
        for (const id of expr.captures ?? []) rejected.add(id);
      if (
        expr.kind === "arrIntrinsic" &&
        candidate(expr.receiver) &&
        ((expr.method === "length" && expr.args.length === 0) ||
          (expr.method === "getNumber" && expr.args.length === 1))
      )
        allow(expr.receiver);
      if (expr.kind === "arrayGet") {
        const c = candidate(expr.arr);
        if (
          c &&
          expr.index.kind === "numLit" &&
          Number.isInteger(expr.index.value) &&
          expr.index.value >= 0 &&
          expr.index.value < c.literal.elems.length
        )
          allow(expr.arr);
      }
      const read = expr.kind === "call" ? reads.get(expr) : null;
      if (read && read.element.kind === "f64" && candidate(read.array)) allow(read.array);
      return true;
    },
  });
  everyStmtList(fn.body, {
    stmt: () => true,
    expr: (expr) => {
      if (expr.kind === "varRef" && candidates.has(expr.localId))
        observed.set(expr.localId, (observed.get(expr.localId) ?? 0) + 1);
      return true;
    },
  });
  for (const [id, c] of candidates) {
    let dominated = 0;
    everyStmtList(c.owner.slice(c.position + 1), {
      stmt: () => true,
      expr: (expr) => {
        if (expr.kind === "varRef" && expr.localId === id) dominated++;
        return true;
      },
    });
    const count = observed.get(id) ?? 0;
    if (count !== (allowed.get(id) ?? 0) || count !== dominated || declared.get(id) !== 1)
      rejected.add(id);
  }
  for (const id of rejected) candidates.delete(id);
  if (!candidates.size) return fn;
  const added: IrLocal[] = [],
    used = new Set(fn.locals.map((local) => local.id));
  let serial = 0;
  const fresh = (): IrLocal => {
    let id: string;
    do {
      id = `%scalar.array.${serial++}`;
    } while (used.has(id));
    used.add(id);
    const local: IrLocal = { id, name: id, type: F64, mutable: true };
    added.push(local);
    return local;
  };
  for (const c of candidates.values()) c.slots = c.literal.elems.map(() => fresh());
  const ref = (local: IrLocal, loc: IrExpr["loc"]): IrExpr => ({
    kind: "varRef",
    localId: local.id,
    type: F64,
    loc,
  });
  const lookup = (
    c: Candidate,
    index: IrExpr,
    missing: IrExpr,
    wrap: (value: IrExpr) => IrExpr,
  ): IrExpr => {
    const loc = index.loc;
    if (index.kind === "numLit") {
      return Number.isInteger(index.value) && index.value >= 0 && index.value < c.slots.length
        ? wrap(ref(c.slots[index.value]!, loc))
        : missing;
    }
    const at = fresh();
    let result = missing;
    for (let i = c.slots.length - 1; i >= 0; i--)
      result = {
        kind: "ternary",
        cond: {
          kind: "bin",
          op: "===",
          left: ref(at, loc),
          right: { kind: "numLit", value: i, type: F64, loc },
          type: BOOL,
          loc,
        },
        then: wrap(ref(c.slots[i]!, loc)),
        else_: result,
        type: missing.type,
        loc,
      };
    return {
      kind: "seqExpr",
      stmts: [{ kind: "varDecl", localId: at.id, init: index, loc }],
      result,
      type: result.type,
      loc,
    };
  };
  const body = transformStmtList(fn.body, {
    stmt: (stmt) => {
      if (stmt.kind === "arraySet") {
        const c = candidate(stmt.arr);
        if (c && stmt.index.kind === "numLit")
          return {
            kind: "assign",
            localId: c.slots[stmt.index.value]!.id,
            value: stmt.value,
            loc: stmt.loc,
          };
      }
      const c = stmt.kind === "varDecl" ? candidates.get(stmt.localId) : undefined;
      return c
        ? {
            kind: "block",
            body: [
              ...c.prefix,
              ...c.slots.map((slot, i): IrStmt => ({
                kind: "varDecl",
                localId: slot.id,
                init: c.literal.elems[i]!,
                loc: stmt.loc,
              })),
            ],
            loc: stmt.loc,
          }
        : stmt;
    },
    expr: (expr) => {
      if (expr.kind === "arrIntrinsic") {
        const c = candidate(expr.receiver);
        if (c && expr.method === "length")
          return { kind: "numLit", value: c.slots.length, type: F64, loc: expr.loc };
        if (c && expr.method === "getNumber")
          return lookup(
            c,
            expr.args[0]!,
            { kind: "numLit", value: NaN, type: F64, loc: expr.loc },
            (value) => value,
          );
      }
      if (expr.kind === "arrayGet") {
        const c = candidate(expr.arr);
        if (c && expr.index.kind === "numLit") return ref(c.slots[expr.index.value]!, expr.loc);
      }
      const read = expr.kind === "call" ? reads.get(expr) : null;
      const c = read ? candidate(read.array) : undefined;
      if (read && c && read.type.kind === "union") {
        const unionId = read.type.unionId;
        const wrap = (value: IrExpr, tag: number): IrExpr => ({
          kind: "unionWrap",
          unionId,
          tag,
          value,
          type: read.type,
          loc: expr.loc,
        });
        return lookup(
          c,
          read.index,
          wrap(
            { kind: "unitLit", unit: "undefined", type: { kind: "undefinedT" }, loc: expr.loc },
            read.missingTag,
          ),
          (value) => wrap(value, read.presentTag),
        );
      }
      return expr;
    },
  });
  return { ...fn, locals: [...fn.locals, ...added], body };
}
