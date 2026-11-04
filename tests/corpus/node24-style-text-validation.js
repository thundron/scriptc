import { styleText as style } from "node:util";
const stored = style;
for (const value of [undefined, null, false, 0, -0, NaN, Infinity, 2n, Symbol("x"), {}, [1, 2]]) {
  try { console.log("text", style("red", value, { validateStream: false })); }
  catch (error) { console.log(error.name, error.code, error.message); }
  try { console.log("format", style(value, "x", { validateStream: false })); }
  catch (error) { console.log(error.name, error.code, error.message); }
  try { console.log("options", style("red", "x", value)); }
  catch (error) { console.log(error.name, error.code, error.message); }
  try { console.log("flag", style(["red"], "x", { validateStream: value })); }
  catch (error) { console.log(error.name, error.code, error.message); }
}
for (const name of ["bad", "toString", "constructor", "__proto__", "a\nb", "a'b", 'a"b', "a'b\"c"]) {
  try { style(name, "x", { validateStream: false }); }
  catch (error) { console.log("bad-style", error.name, error.code, error.message); }
}
for (const options of [null, [], 2, "x", {validateStream: 0}, {validateStream: ""}, {validateStream: null}, {validateStream: false, stream: 2}, {stream: 2}, {stream: {}}, {stream: {isTTY: true}}]) {
  try { console.log("fast", JSON.stringify(stored("red", "x", options))); }
  catch (error) { console.log("fast", error.name, error.code, error.message); }
}
try { style(); } catch (error) { console.log("missing", error.name, error.code, error.message); }
try { stored("red"); } catch (error) { console.log("missing-stored", error.name, error.code, error.message); }
let order = "";
function input(value) { order += value; return value; }
function extra() { order += "extra"; return null; }
console.log("order", JSON.stringify(style(input("red"), input("text"), {validateStream: false}, extra())), order);
try { style("bad", "x", {validateStream: false}, extra()); }
catch (error) { console.log("order-error", order, error.code); }
const formats = ["red"];
function mutate() { formats[0] = "green"; return null; }
console.log("live", JSON.stringify(style(formats, "x", {validateStream: false}, mutate())));
