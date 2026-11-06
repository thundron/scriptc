import { expect, test } from "vitest";
import {
  BOOL,
  F64,
  UNDEFINED_T,
  bytesOf,
  type IrBytesElem,
  type IrExpr,
  type IrFunction,
  type IrType,
  type IrUnionDef,
} from "../../ir/ir.js";
import { OptionalArrayReads } from "./local-array-reads.js";

const loc = { file: "optional-bytes.ts", start: 0, end: 0 };
const optional: IrType = { kind: "union", unionId: "optional" };
const unions = new Map<string, IrUnionDef>([
  ["optional", { id: "optional", arms: [F64, UNDEFINED_T] }],
]);
const ref = (localId: string, type: IrType): IrExpr => ({ kind: "varRef", localId, type, loc });
const num = (value: number): IrExpr => ({ kind: "numLit", value, type: F64, loc });
const wrap = (value: IrExpr, tag: number): IrExpr => ({
  kind: "unionWrap",
  unionId: "optional",
  tag,
  value,
  type: optional,
  loc,
});
const bin = (op: "===" | ">=" | "<", left: IrExpr, right: IrExpr): IrExpr => ({
  kind: "bin",
  op,
  left,
  right,
  type: BOOL,
  loc,
});
const and = (left: IrExpr, right: IrExpr): IrExpr => ({
  kind: "logical",
  op: "&&",
  left,
  right,
  type: BOOL,
  loc,
});

function fixture(
  elem: IrBytesElem,
  nan = elem !== "f16" && elem !== "f32" && elem !== "f64",
): IrFunction {
  const bytes = bytesOf(elem),
    a = ref("a", bytes),
    i = ref("i", F64),
    value = ref("v", F64);
  const get: IrExpr = {
    kind: "bytesIntrinsic",
    receiver: a,
    method: "get",
    args: [i],
    invalidNaN: true,
    type: F64,
    loc,
  };
  const absent = wrap({ kind: "unitLit", unit: "undefined", type: UNDEFINED_T, loc }, 1);
  const params = [
    { localId: "a", name: "a", type: bytes },
    { localId: "i", name: "i", type: F64 },
  ];
  const condition = and(
    bin(">=", i, num(0)),
    and(
      bin("<", i, {
        kind: "bytesIntrinsic",
        receiver: a,
        method: "length",
        args: [],
        type: F64,
        loc,
      }),
      bin("===", { kind: "libCall", fn: "math.trunc", args: [i], type: F64, loc }, i),
    ),
  );
  return {
    name: "arbitraryName",
    params,
    returnType: optional,
    loc,
    locals: [
      ...params.map((p) => ({ id: p.localId, name: p.name, type: p.type, mutable: false })),
      ...(nan ? [{ id: "v", name: "v", type: F64, mutable: false }] : []),
    ],
    body: [
      ...(nan ? [{ kind: "varDecl" as const, localId: "v", init: get, loc }] : []),
      {
        kind: "return",
        loc,
        value: {
          kind: "ternary",
          type: optional,
          loc,
          cond: nan
            ? { kind: "libCall", fn: "num.isNaN", args: [value], type: BOOL, loc }
            : condition,
          then: nan ? absent : wrap(get, 0),
          else_: nan ? wrap(value, 0) : absent,
        },
      },
    ],
  };
}
function match(fn: IrFunction) {
  const call: IrExpr = {
    kind: "call",
    callee: fn.name,
    args: [ref("source", fn.params[0]!.type), num(3)],
    type: optional,
    loc,
  };
  return new OptionalArrayReads(new Map([[fn.name, fn]]), unions).get(call);
}

test.each(["f16", "f32", "f64", "u8", "i16", "i32"] as const)(
  "recognizes complete optional %s read bodies without relying on names",
  (elem) => {
    expect(match(fixture(elem))).toMatchObject({
      bytesElement: elem,
      presentTag: 0,
      missingTag: 1,
    });
  },
);

test.each(["f16", "f32", "f64"] as const)(
  "never conflates a genuine %s NaN with absence",
  (elem) => {
    expect(match(fixture(elem, true))).toBeNull();
  },
);

test.each(["bounds", "receiver", "index", "effect", "tag", "extra statement", "async", "capture"])(
  "rejects a noncanonical optional read: %s",
  (reason) => {
    const fn = fixture("f64");
    const ret = fn.body[0]!;
    if (
      ret.kind !== "return" ||
      ret.value?.kind !== "ternary" ||
      ret.value.then.kind !== "unionWrap" ||
      ret.value.then.value.kind !== "bytesIntrinsic" ||
      ret.value.else_.kind !== "unionWrap"
    )
      throw new Error("fixture");
    const value = ret.value,
      get = ret.value.then.value;
    if (reason === "bounds") value.cond = { kind: "boolLit", value: true, type: BOOL, loc };
    if (reason === "receiver") get.receiver = ref("other", bytesOf("f64"));
    if (reason === "index") get.args = [num(0)];
    if (reason === "effect")
      value.cond = { kind: "call", callee: "effect", args: [], type: BOOL, loc };
    if (reason === "tag") ret.value.else_.tag = 0;
    if (reason === "extra statement") fn.body.unshift({ kind: "exprStmt", expr: num(0), loc });
    if (reason === "async") fn.async = true;
    if (reason === "capture") fn.captures = [];
    expect(match(fn)).toBeNull();
  },
);
