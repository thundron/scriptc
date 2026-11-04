import { stripVTControlCharacters as strip, toUSVString as usv } from "node:util";
const stripStored = strip;
const usvStored = usv;

for (const value of [undefined, null, 0, -0, 1.5, NaN, Infinity, true, false, 2n, Symbol("x"), {}, [], [1, 2]]) {
  try { console.log("strip", strip(value)); }
  catch (error) { console.log(error.name, error.code, error.message); }
  try { console.log("usv", usv(value)); }
  catch (error) { console.log(error.name, error.code, error.message); }
  try { console.log("stored-strip", stripStored(value)); }
  catch (error) { console.log(error.name, error.code, error.message); }
  try { console.log("stored-usv", usvStored(value)); }
  catch (error) { console.log(error.name, error.code, error.message); }
}
try { strip(); } catch (error) { console.log("omitted", error.name, error.code, error.message); }
console.log("omitted-usv", usv());
console.log("identity", strip === stripStored, usv === usvStored);
try { stripStored(); } catch (error) { console.log("omitted-stored", error.name, error.code, error.message); }
console.log("omitted-stored-usv", usvStored());
let order = "";
function extra() { order += "extra"; return null; }
console.log("extras", strip("\u001b[1mx", extra()), order);
console.log("extras", usv("\ud800", extra()), order);
try { strip(12, extra()); } catch (error) { console.log("validation-after-arguments", order, error.code); }
try { usv(Symbol("x"), extra()); } catch (error) { console.log("conversion-after-arguments", order, error.name, error.message); }
