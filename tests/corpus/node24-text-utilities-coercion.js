import { toUSVString as usv } from "node:util";

const calls = [];
const exotic = { [Symbol.toPrimitive](hint) { calls.push(hint); return "\ud800"; } };
console.log("exotic", JSON.stringify(usv(exotic)), calls.join(","));
const ordinary = { toString() { calls.push("toString"); return {}; }, valueOf() { calls.push("valueOf"); return "\udfff"; } };
console.log("ordinary", JSON.stringify(usv(ordinary)), calls.join(","));
const sentinel = new Error("conversion failed");
try { usv({ toString() { throw sentinel; } }); } catch (error) { console.log("throw-identity", error === sentinel); }
try { usv({ [Symbol.toPrimitive]() { throw sentinel; } }); } catch (error) { console.log("exotic-throw-identity", error === sentinel); }
try { usv({ [Symbol.toPrimitive]() { return Symbol("x"); } }); } catch (error) { console.log("symbol-result", error.name, error.message); }
for (const method of [1, -0, NaN, Infinity, true, 2n, Symbol("x"), "bad", "a\nb", '"quoted"', {}, null, undefined]) {
  try { console.log("exotic-method", usv({ [Symbol.toPrimitive]: method })); }
  catch (error) { console.log("exotic-method", error.name, error.message); }
}
try { usv({ [Symbol.toPrimitive]() { return {}; } }); } catch (error) { console.log("exotic-object", error.name, error.message); }
try { usv({ toString() { return {}; }, valueOf() { return {}; } }); } catch (error) { console.log("non-primitive", error.name, error.message); }
const child = Object.create({ [Symbol.toPrimitive](hint) { return this.label + hint; } });
child.label = "inherited:";
console.log("inherited", usv(child));
const getter = {};
Object.defineProperty(getter, Symbol.toPrimitive, { get() { calls.push("get"); return function (hint) { return hint; }; } });
console.log("getter", usv(getter), calls.join(","));
