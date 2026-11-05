import { type IrType, typeEquals, typeKey } from "../../ir/ir.js";
/* Materialized function-with-properties values share one record with the
 * declaration's expando stores. Ordinary expando-only programs retain their
 * existing globals and IR; only a callable-record coercion arms the rewrite. */
import * as ts from "../ts7/adapter.js";
import type { IrExpr, IrFunction, IrGlobal, IrStmt, SrcLoc } from "../../ir/ir.js";
import { mapExprChildren, mapStmtChildren } from "../../ir/traverse.js";
import { varRef } from "../../ir/build.js";
import type { Lowerer } from "./lowerer.js";

export interface CallableExpando {
  global: IrGlobal;
  call: IrExpr;
  file: ts.SourceFile;
  fields: { name: string; global: IrGlobal }[];
}

export function callableExpandoValue(
  lowerer: Lowerer,
  value: IrExpr,
  expected: IrType & { kind: "record" },
): IrExpr | null {
  if (value.kind !== "closure" || value.captures.length !== 0) return null;
  const known = lowerer.callableExpandos.get(value.fnName);
  for (const [symbol, members] of lowerer.expandoMembers) {
    if (lowerer.fnSigsBySymbol.get(symbol)?.name !== value.fnName) continue;
    const declaration = symbol.valueDeclaration;
    if (!declaration || !ts.isFunctionDeclaration(declaration) || members.symbols.size > 0)
      return null;
    // Required typed properties cannot carry JavaScript's initial absence.
    // Materialize only initialized declarations; retain an explicit refusal
    // rather than inventing null/zero before a property's first store.
    const file = ts.getSourceFileOfNode(declaration);
    for (const member of members.names.values()) {
      if (
        member.initialWriteStart === undefined ||
        (value.loc.file === file.fileName && member.initialWriteStart > value.loc.start)
      )
        return null;
    }
    if (known)
      return compatible(lowerer, known, expected)
        ? varRef(known.global.id, known.global.type, value.loc)
        : null;
    const fields = [...members.names].map(([name, member]) => ({ name, global: member.global }));
    if (fields.some((field) => field.name.startsWith("%"))) return null;
    const shapeId = lowerer.shapes.intern(
      [
        { name: "%call", type: value.type },
        ...fields.map(({ name, global }) => ({ name, type: global.type })),
      ].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
      false,
    );

    const global: IrGlobal = {
      id: `%g.callable.${value.fnName}`,
      name: `%callable.${value.fnName}`,
      type: { kind: "record", shapeId },
      mutable: true,
    };
    const item: CallableExpando = {
      global,
      call: value,
      file: ts.getSourceFileOfNode(declaration),
      fields,
    };
    if (!compatible(lowerer, item, expected)) return null;
    lowerer.globalsList.push(global);
    lowerer.callableExpandos.set(value.fnName, {
      global,
      call: value,
      file: ts.getSourceFileOfNode(declaration),
      fields,
    });
    return varRef(global.id, global.type, value.loc);
  }
  return null;
}

export function finalizeCallableExpandos(lowerer: Lowerer, functions: IrFunction[]): void {
  if (lowerer.callableExpandos.size === 0) return;
  const fields = new Map<string, { owner: IrGlobal; name: string }>();
  for (const item of lowerer.callableExpandos.values())
    for (const field of item.fields)
      fields.set(field.global.id, { owner: item.global, name: field.name });
  const object = (owner: IrGlobal, loc: SrcLoc): IrExpr => varRef(owner.id, owner.type, loc);
  const expr = (value: IrExpr): IrExpr => {
    if (value.kind === "varRef") {
      const field = fields.get(value.localId);
      if (field && field.owner.type.kind === "record")
        return {
          kind: "recordGet",
          obj: object(field.owner, value.loc),
          shapeId: field.owner.type.shapeId,
          field: field.name,
          type: value.type,
          loc: value.loc,
        };
    }
    return mapExprChildren(value, expr, stmt);
  };
  const stmt = (value: IrStmt): IrStmt => {
    if (value.kind === "assign") {
      const field = fields.get(value.localId);
      if (field && field.owner.type.kind === "record")
        return {
          kind: "recordSet",
          obj: object(field.owner, value.loc),
          shapeId: field.owner.type.shapeId,
          field: field.name,
          value: expr(value.value),
          loc: value.loc,
        };
    }
    return mapStmtChildren(value, expr, stmt);
  };
  for (const fn of functions) fn.body = fn.body.map(stmt);
  // Insert after the run-once guard and flag store. Cache-hit module visits
  // must not recreate the function object or reset its mutable properties.
  for (const item of lowerer.callableExpandos.values()) {
    const init = functions.find((fn) => fn.name === lowerer.initNameOf.get(item.file));
    if (!init || item.global.type.kind !== "record") continue;
    const loc = item.call.loc;
    const value: IrExpr = {
      kind: "recordLit",
      fields: [
        { name: "%call", value: item.call },
        ...item.fields.map((field) => ({
          name: field.name,
          value: varRef(field.global.id, field.global.type, loc),
        })),
      ],
      type: item.global.type,
      loc,
    };
    init.body.splice(lowerer.moduleGuardOf.has(item.file) ? 2 : 0, 0, {
      kind: "assign",
      localId: item.global.id,
      value,
      loc,
    });
  }
}

// A width view must read exactly matching slots, and its source must not be
// able to hold the view through another property (including opaque closures
// or checked values). Otherwise keep the existing explicit type refusal,
// never a detached snapshot of mutable function properties.
function compatible(
  lowerer: Lowerer,
  item: CallableExpando,
  expected: IrType & { kind: "record" },
): boolean {
  if (typeEquals(item.global.type, expected)) return true;
  const target = lowerer.shapes.get(expected.shapeId);
  const source = new Map([
    ["%call", item.call.type] as const,
    ...item.fields.map((field) => [field.name, field.global.type] as const),
  ]);
  if (
    !target ||
    !target.fields.every(
      (field) => source.has(field.name) && typeEquals(source.get(field.name)!, field.type),
    )
  )
    return false;
  const seen = new Set<string>();
  const safe = (type: IrType): boolean => {
    const key = typeKey(type);
    if (seen.has(key)) return true;
    seen.add(key);
    switch (type.kind) {
      case "array":
      case "set":
        return safe(type.elem);
      case "map":
        return safe(type.key) && safe(type.value);
      case "record":
        return lowerer.shapes.get(type.shapeId)?.fields.every((field) => safe(field.type)) === true;
      case "union":
        return lowerer.unions.get(type.unionId)?.arms.every(safe) === true;
      case "f64":
      case "bool":
      case "string":
      case "nullT":
      case "undefinedT":
        return true;
      default:
        return false;
    }
  };
  return item.fields.every((field) => safe(field.global.type));
}
