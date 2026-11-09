import { type IrExpr, type IrModule, type IrStmt } from "../../ir/ir.js";
import { everyStmtList } from "../../ir/traverse.js";
import type { LlvmEmitterContext } from "./expr-context.js";
import { f64Lit } from "./common.js";
export interface AppendReserve {
  array: IrExpr;
  bound: IrExpr;
}
const ref = (e: IrExpr, id: string): boolean => e.kind === "varRef" && e.localId === id;
const num = (e: IrExpr, n: number): boolean => e.kind === "numLit" && e.value === n;

/** Capacity is unobservable. Reserve once for a fresh array immediately
 * preceding a simple counted append loop, never for an effectful or rebound
 * bound. Large, nonfinite and negative bounds retain ordinary growth. */
export function findAppendLoopReserves(mod: IrModule): ReadonlyMap<IrStmt, AppendReserve> {
  const result = new Map<IrStmt, AppendReserve>(),
    globals = new Set((mod.globals ?? []).map((g) => g.id));
  for (const fn of mod.functions) {
    if (fn.async || fn.generator || !fn.locals.some((l) => l.type.kind === "array")) continue;
    const locals = new Map(fn.locals.map((l) => [l.id, l])),
      lists: IrStmt[][] = [fn.body];
    everyStmtList(fn.body, {
      expr: () => true,
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
        if (s.kind === "switch") for (const c of s.cases) lists.push(c.body);
        if (s.kind === "tryCatch") {
          lists.push(s.tryBody);
          if (s.catchBody) lists.push(s.catchBody);
          if (s.finallyBody) lists.push(s.finallyBody);
        }
        return true;
      },
    });
    for (const list of lists)
      for (let i = 1; i < list.length; i++) {
        const decl = list[i - 1]!,
          loop = list[i]!;
        if (
          decl.kind !== "varDecl" ||
          decl.init?.kind !== "arrayLit" ||
          decl.init.elems.length ||
          (decl.init.spreads?.length ?? 0) ||
          decl.init.type.kind !== "array" ||
          globals.has(decl.localId) ||
          !locals.has(decl.localId) ||
          locals.get(decl.localId)!.boxed ||
          locals.get(decl.localId)!.tdz
        )
          continue;
        if (
          loop.kind !== "for" ||
          loop.init?.kind !== "varDecl" ||
          !loop.init.init ||
          !num(loop.init.init, 0) ||
          loop.cond?.kind !== "bin" ||
          loop.cond.op !== "<" ||
          !ref(loop.cond.left, loop.init.localId)
        )
          continue;
        const index = loop.init.localId,
          bound = loop.cond.right;
        if (
          bound.kind !== "numLit" &&
          !(
            bound.kind === "varRef" &&
            bound.type.kind === "f64" &&
            bound.localId !== index &&
            locals.has(bound.localId) &&
            !globals.has(bound.localId) &&
            !locals.get(bound.localId)!.boxed &&
            !locals.get(bound.localId)!.tdz
          )
        )
          continue;
        if (
          loop.update?.kind !== "assign" ||
          loop.update.localId !== index ||
          loop.update.value.kind !== "bin" ||
          loop.update.value.op !== "+" ||
          !ref(loop.update.value.left, index) ||
          !num(loop.update.value.right, 1)
        )
          continue;
        let append = false,
          invalid = false;
        const writes = (id: string): void => {
          if (
            id === decl.localId ||
            id === index ||
            (bound.kind === "varRef" && id === bound.localId)
          )
            invalid = true;
        };
        everyStmtList(loop.body, {
          stmt: (s) => {
            if (s.kind === "assign") writes(s.localId);
            if (s.kind === "varDecl") writes(s.localId);
            if (s.kind === "break" || s.kind === "return") invalid = true;
            return true;
          },
          expr: (e) => {
            if (e.kind === "assignExpr" || e.kind === "incDec") writes(e.localId);
            if (e.kind === "closure" || e.kind === "classRef")
              for (const id of e.captures ?? [])
                if (bound.kind === "varRef" && id === bound.localId) invalid = true;
            if (
              e.kind === "arrIntrinsic" &&
              e.method === "push" &&
              ref(e.receiver, decl.localId) &&
              e.args.length
            )
              append = true;
            return true;
          },
        });
        if (append && !invalid)
          result.set(loop, {
            array: { kind: "varRef", localId: decl.localId, type: decl.init.type, loc: decl.loc },
            bound,
          });
      }
  }
  return result;
}

export function emitAppendLoopReserve(host: LlvmEmitterContext, hint: AppendReserve): void {
  const B = host.B,
    // The preceding declaration owns this local. Reserve cannot call user
    // code or replace the binding, so no temporary owner crosses the loop.
    array = host.emitReadReceiver(hint.array),
    bound = host.emitExpr(hint.bound);
  const positive = B.tmp(),
    bounded = B.tmp(),
    valid = B.tmp(),
    count = B.tmp();
  const reserve = B.newLabel("arr.append.reserve"),
    done = B.newLabel("arr.append.ready");
  B.line(`${positive} = fcmp ogt double ${bound.name}, 0.0`);
  B.line(`${bounded} = fcmp ole double ${bound.name}, ${f64Lit(1048576)}`);
  B.line(`${valid} = and i1 ${positive}, ${bounded}`);
  B.condBr(valid, reserve, done);
  B.startBlock(reserve);
  host.declare("declare double @llvm.ceil.f64(double)");
  host.declare("declare void @scr_arr_reserve_len(ptr, double)");
  B.line(`${count} = call double @llvm.ceil.f64(double ${bound.name})`);
  B.line(`call void @scr_arr_reserve_len(ptr ${array.name}, double ${count})`);
  B.br(done);
  B.startBlock(done);
}
