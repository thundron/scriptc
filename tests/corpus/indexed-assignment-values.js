let values;
((entry) => {
  entry[entry["Left"] = 0] = "Left";
  entry[entry["Right"] = 1] = "Right";
})(values ||= {});
console.log(values.Left, values[0], values.Right, values[1]);
let order = "";
let object = {};
const original = object;
function receiver() { order += "r"; return object; }
function key() { order += "k"; return "answer"; }
function value() { order += "v"; object = {}; return 42; }
console.log(receiver()[key()] = value(), order, original.answer, object.answer);
const token = { toString() { order += "c"; return "key"; } };
order = "";
console.log(original[token] = value(), order);
console.log(original["missing"] = undefined, "missing" in original);
const setter = {};
Object.defineProperty(setter, "x", { set(v) { order += v; }, get() { throw new Error("must not read"); } });
order = "";
console.log(setter["x"] = 7, order);
let bad = null;
order = "";
try { bad[key()] = value(); } catch (error) { console.log(error.name, order); }
order = "";
try { console.log(bad[token] = value()); } catch (error) { console.log(error.name, error.message, order); }
order = "";
const failingKey = { toString() { order += "c"; throw new Error("key"); } };
try { console.log(original[failingKey] = value()); } catch (error) { console.log(error.message, order); }
order = "";
function failValue() { order += "v"; throw new Error("value"); }
try { console.log(original[token] = failValue()); } catch (error) { console.log(error.message, order); }
