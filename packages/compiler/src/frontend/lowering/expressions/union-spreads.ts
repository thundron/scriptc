import * as ts from "../../ts7/adapter.js";
import { locOf, isJsSourceFile } from "../../program.js";
import { literalValues } from "../../literal-values.js";
import { PERF_ENTRY_MARKER, X509_PUBLIC_KEY_FIELD } from "../../type-mapper.js";
import {
  BOOL,
  isUnitType,
  shapeHasAccessorSlots,
  typeEquals,
  UNDEFINED_T,
  type IrExpr,
  type IrRecordField,
  type IrRecordShape,
  type IrStmt,
  type IrType,
  type IrUnionDef,
} from "../../../ir/ir.js";
import { varRef } from "../../../ir/build.js";
import type { Lowerer } from "../lowerer.js";

const MAX_UNION_SPREAD_COMBINATIONS = 256;
type RecordType = IrType & { kind: "record" };
interface Spread {
  kind: "spread";
  node: ts.Expression;
  type: IrType;
  arms: IrType[];
  union?: IrUnionDef;
}
interface Property {
  kind: "property";
  node: ts.Expression;
  prop: ts.PropertyAssignment | ts.ShorthandPropertyAssignment;
  name: string;
  type: IrType;
}
type Contributor = Spread | Property;
interface Operations {
  source(node: ts.Expression): ts.Expression | null;
  name(name: ts.PropertyName): string | null;
  build(type: RecordType): IrExpr;
  shorthand(prop: ts.ShorthandPropertyAssignment): IrExpr;
}

function plainShape(lowerer: Lowerer, type: IrType): IrRecordShape | null {
  if (type.kind !== "record") return null;
  const shape = lowerer.shapes.get(type.shapeId);
  if (
    !shape ||
    shape.tuple ||
    shape.indexValue ||
    shapeHasAccessorSlots(shape) ||
    shape.fields.some(
      (field) =>
        field.name.startsWith("%") ||
        field.name === "__proto__" ||
        field.name === PERF_ENTRY_MARKER ||
        field.name === X509_PUBLIC_KEY_FIELD,
    )
  )
    return null;
  return shape;
}
function emptySpread(type: IrType): boolean {
  return (
    isUnitType(type) ||
    type.kind === "bool" ||
    type.kind === "f64" ||
    type.kind === "bigint" ||
    type.kind === "symbol"
  );
}
function optional(lowerer: Lowerer, field: IrRecordField): boolean {
  return (
    field.optional === true ||
    (field.type.kind === "union" && lowerer.armTag(field.type.unionId, UNDEFINED_T) >= 0)
  );
}
/** Total, identity-preserving field admission. No checked extraction or
 * nested reshape is guessed while selecting a result variant. */
function admits(lowerer: Lowerer, source: IrType, target: IrType): boolean {
  if (typeEquals(source, target)) return true;
  if (target.kind !== "union") return false;
  const arms = lowerer.unions.get(target.unionId)?.arms;
  if (!arms) return false;
  const sources = source.kind === "union" ? lowerer.unions.get(source.unionId)?.arms : [source];
  return (
    sources !== undefined &&
    sources.every((arm) => arms.some((candidate) => typeEquals(arm, candidate)))
  );
}

/** Finite plain-record unions construct native record/union values. A common
 * optional result layout needs no dispatch. Otherwise, snapshot contributors
 * in source order before dispatching over their native tags. Copies are
 * shallow: later effects cannot change copied slots, but nested references
 * keep their identity. Observed copies use the existing own-key metadata.
 * Arbitrary keys, accessors, string spreads and prototypes stay fenced. */
export function lowerFiniteUnionSpreadMerge(
  lowerer: Lowerer,
  expr: ts.ObjectLiteralExpression,
  target: IrType & { kind: "union" },
  ops: Operations,
): IrExpr | null {
  if (isJsSourceFile(ts.getSourceFileOfNode(expr))) return null;
  const targetDef = lowerer.unions.get(target.unionId);
  if (!targetDef) return null;
  const contributors: Contributor[] = [];
  let hasUnion = false;
  for (const prop of expr.properties.nodes) {
    if (ts.isSpreadAssignment(prop)) {
      const node = ops.source(prop.expression);
      if (!node) return null;
      const type = lowerer.mapTypeOf(lowerer.typeOf(node));
      if (!type) return null;
      const union = type.kind === "union" ? lowerer.unions.get(type.unionId) : undefined;
      const arms = union?.arms ?? [type];
      if (!arms.every((arm) => emptySpread(arm) || plainShape(lowerer, arm) !== null)) return null;
      hasUnion ||= union !== undefined;
      contributors.push({ kind: "spread", node, type, arms, ...(union ? { union } : {}) });
    } else if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
      const name = ops.name(prop.name);
      if (name === null || name === "__proto__") return null;
      const node = ts.isPropertyAssignment(prop) ? prop.initializer : (prop.name as ts.Identifier);
      const type = lowerer.mapTypeOf(lowerer.typeOf(node));
      if (!type) return null;
      contributors.push({ kind: "property", node, prop, name, type });
    } else return null;
  }
  if (!hasUnion) return null;
  const candidates = targetDef.arms.flatMap((type, tag) => {
    const shape = plainShape(lowerer, type);
    return shape && type.kind === "record" ? [{ type, tag, shape }] : [];
  });
  if (!candidates.length) return null;
  const loc = locOf(expr);
  const preserveOrder = (value: IrExpr): IrExpr => {
    let literal = value;
    while (literal.kind === "seqExpr") literal = literal.result;
    if (literal.kind === "recordLit") lowerer.keyOrder.preserveSpreadOrder(literal);
    return value;
  };
  const wrap = (value: IrExpr, tag: number): IrExpr => ({
    kind: "unionWrap",
    unionId: target.unionId,
    tag,
    value: preserveOrder(value),
    type: target,
    loc,
  });

  // A non-discriminated, all-optional arm may hold every combination. The
  // ordinary literal builder already snapshots values and field presence
  // in source order, including effectful prefixes and overwritten fields.
  if (
    !targetDef.discriminant &&
    contributors.every(
      (contributor) =>
        contributor.kind === "property" ||
        (contributor.arms.every((arm) => arm.kind === "record" || isUnitType(arm)) &&
          !ts.isConditionalExpression(contributor.node) &&
          !(
            ts.isBinaryExpression(contributor.node) &&
            contributor.node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
          )),
    )
  ) {
    const fields = new Map<string, IrType[]>();
    for (const contributor of contributors) {
      if (contributor.kind === "property") {
        fields.set(contributor.name, [contributor.type]);
      } else
        for (const arm of contributor.arms) {
          if (arm.kind !== "record") continue;
          for (const field of plainShape(lowerer, arm)!.fields)
            fields.set(field.name, [...(fields.get(field.name) ?? []), field.type]);
        }
    }
    for (const candidate of candidates) {
      if (!candidate.shape.fields.every((field) => optional(lowerer, field))) continue;
      if (
        [...fields].every(([name, types]) => {
          const field = candidate.shape.fields.find((field) => field.name === name);
          return field !== undefined && types.every((type) => admits(lowerer, type, field.type));
        })
      )
        return wrap(ops.build(candidate.type), candidate.tag);
    }
  }

  const spreads = contributors.filter(
    (contributor): contributor is Spread => contributor.kind === "spread",
  );
  let combinations = 1;
  for (const spread of spreads) {
    combinations *= spread.arms.length;
    if (combinations > MAX_UNION_SPREAD_COMBINATIONS) return null;
  }
  interface Writer {
    types: IrType[];
    present: boolean;
    values: ReturnType<typeof literalValues>;
  }
  const destination = (tags: number[]): number | null => {
    const fields = new Map<string, Writer>();
    let source = 0;
    for (const contributor of contributors) {
      if (contributor.kind === "property") {
        fields.set(contributor.name, {
          types: [contributor.type],
          present: true,
          values: literalValues(lowerer.typeOf(contributor.node)),
        });
      } else {
        const tag = tags[source++]!,
          arm = contributor.arms[tag]!;
        if (arm.kind !== "record") continue;
        for (const field of plainShape(lowerer, arm)!.fields) {
          const previous = fields.get(field.name),
            maybe = optional(lowerer, field);
          const values =
            contributor.union?.discriminant?.field === field.name
              ? (contributor.union.discriminant.cases.find((candidate) => candidate.tag === tag)
                  ?.values ?? null)
              : null;
          fields.set(field.name, {
            types: maybe ? [...(previous?.types ?? []), field.type] : [field.type],
            present: !maybe || previous?.present === true,
            values: maybe ? null : values,
          });
        }
      }
    }
    const matching = candidates.filter((candidate) => {
      if (
        ![...fields].every(([name, writer]) => {
          const field = candidate.shape.fields.find((field) => field.name === name);
          return (
            field !== undefined && writer.types.every((type) => admits(lowerer, type, field.type))
          );
        })
      )
        return false;
      if (
        !candidate.shape.fields.every(
          (field) => optional(lowerer, field) || fields.get(field.name)?.present === true,
        )
      )
        return false;
      if (targetDef.discriminant) {
        const values = fields.get(targetDef.discriminant.field)?.values;
        const allowed = targetDef.discriminant.cases.find((c) => c.tag === candidate.tag)?.values;
        if (!values || !allowed || !values.every((value) => allowed.includes(value))) return false;
      }
      return true;
    });
    const exact = matching.find((candidate) => candidate.shape.fields.length === fields.size);
    return (exact ?? matching[0])?.tag ?? null;
  };
  const destinations = new Map<string, number>();
  const tags: number[] = [];
  const plan = (index: number): boolean => {
    if (index === spreads.length) {
      const tag = destination(tags);
      if (tag === null) return false;
      destinations.set(tags.join(","), tag);
      return true;
    }
    for (let tag = 0; tag < spreads[index]!.arms.length; tag++) {
      tags[index] = tag;
      if (!plan(index + 1)) return false;
    }
    return true;
  };
  if (!plan(0)) return null;

  const stmts: IrStmt[] = [];
  const snapshots = new Map<Contributor, IrExpr>();
  const save = (value: IrExpr): IrExpr => {
    const local = lowerer.declareHiddenLocal("%spreadSnapshot", value.type);
    stmts.push({ kind: "varDecl", localId: local.id, init: value, loc: value.loc });
    return varRef(local.id, value.type, value.loc);
  };
  const clone = (source: IrExpr, type: RecordType): IrExpr =>
    lowerer.keyOrder.clone({ kind: "recordClone", source, overrides: [], type, loc });
  const empty = (): IrExpr => ({
    kind: "recordLit",
    fields: [],
    type: { kind: "record", shapeId: lowerer.shapes.intern([]) },
    loc,
  });
  for (const contributor of contributors) {
    let value =
      contributor.kind === "property" && ts.isShorthandPropertyAssignment(contributor.prop)
        ? ops.shorthand(contributor.prop)
        : lowerer.lowerExpr(contributor.node);
    if (contributor.kind === "property") {
      snapshots.set(contributor, save(value));
      continue;
    }
    value = lowerer.coerceToExpected(value, contributor.type);
    if (!typeEquals(value.type, contributor.type)) return null;
    if (contributor.type.kind === "record") value = clone(value, contributor.type);
    else if (contributor.type.kind === "union") {
      const original = save(value),
        type = contributor.type;
      let result = original;
      for (let tag = contributor.arms.length - 1; tag >= 0; tag--) {
        const arm = contributor.arms[tag]!;
        if (arm.kind !== "record") continue;
        result = {
          kind: "ternary",
          cond: {
            kind: "unionIsTag",
            value: original,
            unionId: type.unionId,
            tag,
            negated: false,
            type: BOOL,
            loc,
          },
          then: {
            kind: "unionWrap",
            unionId: type.unionId,
            tag,
            value: clone(
              { kind: "unionNarrow", value: original, unionId: type.unionId, tag, type: arm, loc },
              arm,
            ),
            type,
            loc,
          },
          else_: result,
          type,
          loc,
        };
      }
      value = result;
    } else {
      stmts.push({ kind: "exprStmt", expr: value, loc: value.loc });
      snapshots.set(contributor, empty());
      continue;
    }
    snapshots.set(contributor, save(value));
  }
  const selected: number[] = [];
  const build = (index: number): IrExpr => {
    if (index < spreads.length) {
      const spread = spreads[index]!;
      if (!spread.union) {
        selected[index] = 0;
        return build(index + 1);
      }
      let result: IrExpr | null = null;
      for (let tag = spread.arms.length - 1; tag >= 0; tag--) {
        selected[index] = tag;
        const branch = build(index + 1);
        result =
          result === null
            ? branch
            : {
                kind: "ternary",
                cond: {
                  kind: "unionIsTag",
                  value: snapshots.get(spread)!,
                  unionId: spread.union.id,
                  tag,
                  negated: false,
                  type: BOOL,
                  loc,
                },
                then: branch,
                else_: result,
                type: target,
                loc,
              };
      }
      return result!;
    }
    const overrides: { node: ts.Expression; value: IrExpr }[] = [];
    const previous: (IrExpr | undefined)[] = [];
    let indexOfSpread = 0;
    for (const contributor of contributors) {
      let value = snapshots.get(contributor)!;
      if (contributor.kind === "spread") {
        const tag = selected[indexOfSpread++]!,
          arm = contributor.arms[tag]!;
        if (emptySpread(arm)) value = empty();
        else if (contributor.union)
          value = {
            kind: "unionNarrow",
            value,
            unionId: contributor.union.id,
            tag,
            type: arm,
            loc,
          };
        previous.push(lowerer.spreadArmOverrides.get(contributor.node));
        lowerer.spreadArmOverrides.set(contributor.node, value);
      }
      overrides.push({ node: contributor.node, value });
    }
    try {
      const tag = destinations.get(selected.join(","))!;
      const candidate = candidates.find((candidate) => candidate.tag === tag)!;
      return lowerer.withExpressionOverrides(overrides, () => wrap(ops.build(candidate.type), tag));
    } finally {
      for (let i = spreads.length - 1; i >= 0; i--) {
        const node = spreads[i]!.node,
          value = previous[i];
        if (value) lowerer.spreadArmOverrides.set(node, value);
        else lowerer.spreadArmOverrides.delete(node);
      }
    }
  };
  const result = build(0);
  return { kind: "seqExpr", stmts, result, type: target, loc };
}
