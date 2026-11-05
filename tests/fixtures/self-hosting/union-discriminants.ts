import { F64, UNDEFINED_T, type IrType, type IrUnionDef, type IrUnionDiscriminant } from "../../../packages/compiler/src/ir/ir.js";
import { remapUnionDiscriminant } from "../../../packages/compiler/src/frontend/union-discriminants.js";

const arms: IrType[] = [];
const cases: IrUnionDiscriminant["cases"] = [];
for (let tag = 0; tag < 128; tag++) {
  const shapeId = tag === 0 ? "__proto__" : tag === 1 ? "constructor" : "r" + tag;
  arms.push({ kind: "record", shapeId });
  cases.push({ tag, values: ["kind" + tag, tag, tag % 2 === 0] });
}
const source: IrUnionDef = { id: "u0", arms, discriminant: { field: "kind", cases } };
const target = [UNDEFINED_T, ...arms.slice().reverse(), F64];
const remapped = remapUnionDiscriminant(source, target);
if (!remapped) throw new Error("missing discriminator");
console.log("wide", remapped.field, remapped.cases.length, remapped.cases[0]!.tag, remapped.cases[0]!.values.join(","), remapped.cases[127]!.tag);
const restored = remapUnionDiscriminant({ id: "u1", arms: target, discriminant: remapped }, arms);
if (!restored) throw new Error("missing restored discriminator");
console.log("roundtrip", JSON.stringify(restored) === JSON.stringify({ field: "kind", cases }));
const subset = remapUnionDiscriminant(source, [arms[1]!, UNDEFINED_T, arms[0]!]);
if (!subset) throw new Error("missing subset discriminator");
console.log("subset", JSON.stringify(subset));
console.log("duplicate", remapUnionDiscriminant(source, [arms[0]!, arms[0]!]) === undefined);
console.log("new-record", remapUnionDiscriminant(source, [...arms, { kind: "record", shapeId: "new" }]) === undefined);
console.log("scalar-only", remapUnionDiscriminant(source, [F64, UNDEFINED_T]) === undefined);
remapped.cases[0]!.values.push("changed");
console.log("copied", cases[127]!.values.length, arms[0]!.kind === "record" ? arms[0]!.shapeId : "unexpected");
cases.pop();
console.log("incomplete-source", remapUnionDiscriminant(source, [arms[0]!]) === undefined);
cases.push({ tag: 0, values: ["duplicate"] });
console.log("duplicate-source", remapUnionDiscriminant(source, arms) === undefined);
