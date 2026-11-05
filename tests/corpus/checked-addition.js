function add(a, b) { return a + b; }
console.log(add(2, 3), add("2", 3), add(2, "3"), add(true, null));
console.log(add(undefined, 3), add([1, 2], [3]), add({}, 1));
let trace = "";
const left = { value: "left", valueOf: function() { trace += "L"; return this.value; } };
const right = { valueOf() { trace += "R"; return 2; } };
console.log(add(left, right), trace);
console.log(add({ valueOf() { return {}; }, toString() { return "fallback"; } }, 4));
console.log(add({ valueOf() { return false; } }, true));
try { add({ valueOf() { throw new Error("conversion"); } }, right); }
catch (error) { console.log(error.message, trace); }
try { add({ valueOf() { return {}; }, toString() { return {}; } }, 1); }
catch (error) { console.log(error.name, error.message); }
const empty = Object.create(null);
try { add(empty, "x"); } catch (error) { console.log(error.name); }
function stringLeft(value) { return "prefix:" + value; }
console.log(stringLeft({ valueOf() { return 8; }, toString() { return "wrong"; } }));
function removeHook(object) { delete object.valueOf; }
const changing = { valueOf: function() { removeHook(this); return 6; } };
console.log(add(changing, 1), add(changing, 1));
