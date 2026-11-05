const n: number = 3;
const t = n > 0 ? "pos" : "neg";
const o = { ...{ a: 1 } };
const b = "a" in { a: 1 };
const m = typeof "ab".indexOf("b"); // a CALL operand — pure computations fold now
const u = n === 3 ? 1 : 2;
const s: string = "abc";
const mixed = n === 3 && s;
console.log(t, m, u, b, mixed, o.a);
let effects = "";
function produce(): number { effects += "called"; return 17; }
console.log(typeof produce(), effects);
function fail(): number { effects += ":throw"; throw new Error("operand"); }
try { console.log(typeof fail()); } catch (error) {
  if (error instanceof Error) console.log(error.message, effects);
}
