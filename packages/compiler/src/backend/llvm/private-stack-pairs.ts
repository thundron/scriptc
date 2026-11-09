import { F64, type IrExpr, type IrLocal, type IrModule, type IrStmt } from "../../ir/ir.js";
import { everyStmtList, transformStmtList } from "../../ir/traverse.js";
interface Pair {
  push: IrStmt;
  pop: IrExpr & { kind: "arrIntrinsic" };
  id: string;
  value: IrExpr;
  tag: number;
  slot?: IrLocal;
}

/** Eliminate balanced, adjacent pushes/pops on private empty numeric stacks.
 * Every reference must belong to a proved pair; captures, length observers,
 * growth, conditional pops and other consumers retain the ordinary array. */
export function eliminatePrivateStackPairs(mod: IrModule): IrModule {
  const globals = new Set((mod.globals ?? []).map((g) => g.id)),
    unions = new Map((mod.unions ?? []).map((u) => [u.id, u]));
  let changed = false;
  const functions = mod.functions.map((fn) => {
    if (fn.async || fn.generator) return fn;
    const locals = new Map(fn.locals.map((l) => [l.id, l])),
      parameters = new Set(fn.params.map((p) => p.localId));
    const candidates = new Map<string, number>();
    fn.body.forEach((s, i) => {
      if (
        s.kind === "varDecl" &&
        s.init?.kind === "arrayLit" &&
        s.init.type.kind === "array" &&
        s.init.type.elem.kind === "f64" &&
        !s.init.elems.length &&
        !s.init.spreads?.length &&
        !globals.has(s.localId) &&
        !parameters.has(s.localId) &&
        locals.has(s.localId) &&
        !locals.get(s.localId)!.boxed &&
        !locals.get(s.localId)!.tdz
      )
        candidates.set(s.localId, i);
    });
    if (!candidates.size) return fn;
    const lists: IrStmt[][] = [fn.body],
      rejected = new Set<string>(),
      refs = new Map<string, number>();
    const localNumber = (e: IrExpr): boolean =>
      e.kind === "numLit" ||
      (e.kind === "varRef" &&
        e.type.kind === "f64" &&
        locals.has(e.localId) &&
        !globals.has(e.localId) &&
        !locals.get(e.localId)!.boxed &&
        !locals.get(e.localId)!.tdz);
    const pop = (e: IrExpr): Pair["pop"] | null => {
      if (
        e.kind === "arrIntrinsic" &&
        e.method === "pop" &&
        !e.args.length &&
        e.receiver.kind === "varRef" &&
        candidates.has(e.receiver.localId)
      )
        return e;
      if (e.kind === "call" && e.args.length === 1) return pop(e.args[0]!);
      if (e.kind === "unionNarrow") return pop(e.value);
      if (e.kind === "bin") return pop(e.left) ?? (localNumber(e.left) ? pop(e.right) : null);
      return null;
    };
    fn.body.forEach((statement, position) =>
      everyStmtList([statement], {
        stmt: (s) => {
          if (
            s.kind === "block" ||
            s.kind === "for" ||
            s.kind === "while" ||
            s.kind === "doWhile" ||
            s.kind === "forOf"
          )
            lists.push(s.body);
          if (s.kind === "if") {
            lists.push(s.then);
            if (s.else_) lists.push(s.else_);
          }
          if (s.kind === "tryCatch") {
            lists.push(s.tryBody);
            if (s.catchBody) lists.push(s.catchBody);
            if (s.finallyBody) lists.push(s.finallyBody);
          }
          if (s.kind === "switch") for (const arm of s.cases) lists.push(arm.body);
          if (s.kind === "assign") rejected.add(s.localId);
          if (
            s.kind === "varDecl" &&
            candidates.has(s.localId) &&
            position !== candidates.get(s.localId)
          )
            rejected.add(s.localId);
          return true;
        },
        expr: (e) => {
          if (e.kind === "closure" || e.kind === "classRef")
            for (const id of e.captures ?? []) rejected.add(id);
          if (e.kind === "assignExpr" || e.kind === "incDec") rejected.add(e.localId);
          if (e.kind === "varRef" && candidates.has(e.localId)) {
            refs.set(e.localId, (refs.get(e.localId) ?? 0) + 1);
            if (position <= candidates.get(e.localId)!) rejected.add(e.localId);
          }
          return true;
        },
      }),
    );
    const pairs: Pair[] = [],
      counts = new Map<string, number>();
    const seenPush = new Set<IrStmt>(),
      seenPop = new Set<IrExpr>();
    for (const list of lists)
      for (let i = 0; i + 1 < list.length; i++) {
        const push = list[i]!,
          next = list[i + 1]!;
        if (
          push.kind !== "exprStmt" ||
          push.expr.kind !== "arrIntrinsic" ||
          push.expr.method !== "push" ||
          push.expr.receiver.kind !== "varRef" ||
          push.expr.args.length !== 1 ||
          push.expr.args[0]!.type.kind !== "f64"
        )
          continue;
        const id = push.expr.receiver.localId;
        if (!candidates.has(id)) continue;
        const value =
          next.kind === "varDecl"
            ? next.init
            : next.kind === "assign"
              ? next.value
              : next.kind === "exprStmt"
                ? next.expr
                : next.kind === "return"
                  ? next.value
                  : null;
        const read = value ? pop(value) : null;
        if (
          !read ||
          read.receiver.kind !== "varRef" ||
          read.receiver.localId !== id ||
          read.type.kind !== "union"
        )
          continue;
        const arms = unions.get(read.type.unionId)?.arms;
        if (!arms || arms.length !== 2 || !arms.some((a) => a.kind === "undefinedT")) continue;
        const tag = arms.findIndex((a) => a.kind === "f64");
        if (tag < 0) continue;
        if (seenPush.has(push) || seenPop.has(read)) rejected.add(id);
        seenPush.add(push);
        seenPop.add(read);
        pairs.push({ push, pop: read, id, value: push.expr.args[0]!, tag });
        counts.set(id, (counts.get(id) ?? 0) + 2);
      }
    const kept = pairs.filter((p) => !rejected.has(p.id) && refs.get(p.id) === counts.get(p.id));
    if (!kept.length) return fn;
    const used = new Set([
      ...fn.locals.map((l) => l.id),
      ...fn.params.map((p) => p.localId),
      ...globals,
    ]);
    let serial = 0;
    const added: IrLocal[] = [],
      pushes = new Map<IrStmt, Pair>(),
      pops = new Map<IrExpr, Pair>();
    for (const pair of kept) {
      let id: string;
      do {
        id = `%stack.pair.${serial++}`;
      } while (used.has(id));
      used.add(id);
      pair.slot = { id, name: id, type: F64, mutable: false };
      added.push(pair.slot);
      pushes.set(pair.push, pair);
      pops.set(pair.pop, pair);
    }
    const body = transformStmtList(fn.body, {
      stmt: (s) => {
        const p = pushes.get(s);
        return p ? { kind: "varDecl", localId: p.slot!.id, init: p.value, loc: s.loc } : s;
      },
      expr: (e) => {
        const p = pops.get(e);
        return p && e.type.kind === "union"
          ? {
              kind: "unionWrap",
              unionId: e.type.unionId,
              tag: p.tag,
              value: { kind: "varRef", localId: p.slot!.id, type: F64, loc: e.loc },
              type: e.type,
              loc: e.loc,
            }
          : e;
      },
    });
    changed = true;
    return { ...fn, locals: [...fn.locals, ...added], body };
  });
  return changed ? { ...mod, functions } : mod;
}
