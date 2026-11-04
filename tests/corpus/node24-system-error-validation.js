import { getSystemErrorName, getSystemErrorMessage, getSystemErrorMap } from "node:util";

for (const value of [undefined, null, "-2", true, 2n, {}, [], 0, -0, 0.5, -0.5, NaN, Infinity, -Infinity, 4294967297, -9007199254740992]) {
  try { console.log("name", getSystemErrorName(value)); }
  catch (error) { console.log(error.name, error.code, error.message); }
  try { console.log("message", getSystemErrorMessage(value)); }
  catch (error) { console.log(error.name, error.code, error.message); }
}
try { getSystemErrorName(); } catch (error) { console.log("omitted", error.name, error.code, error.message); }
try { getSystemErrorMessage(); } catch (error) { console.log("omitted", error.name, error.code, error.message); }

let order = "";
function extra() { order += "extra"; return null; }
console.log("extras", getSystemErrorName(-3001, extra()), order);
console.log("extra-map", getSystemErrorMap(extra()).size, order);
try { getSystemErrorMessage("bad", extra()); }
catch (error) { console.log("validation-after-arguments", order, error.code); }
