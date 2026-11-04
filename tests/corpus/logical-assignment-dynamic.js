let effects = "";
const object = JSON.parse('{"zero":0,"text":"ok","nothing":null,"flag":false}');
function receiver() { effects += "O"; return object; }
/** @param {string} value */
function key(value) { effects += "K"; return value; }
function value(next) { effects += "V"; return next; }
console.log(receiver()[key("zero")] &&= value(1), effects);
console.log(receiver()[key("zero")] ||= value(2), effects);
console.log(receiver()[key("text")] ||= value("skip"), effects);
console.log(receiver()[key("text")] &&= value("changed"), effects);
console.log(object.nothing &&= value(3), effects);
console.log(object.flag ||= value(true), effects);
console.log(object.missing ||= value("new"), effects);
console.log(JSON.stringify(object));

// Accessor calls cross the checked native object boundary. Reading once
// and preserving the raw RHS result are observable even when setters mutate.
const accessors = JSON.parse("{}");
let stored = 0;
Object.defineProperty(accessors, "item", {
  get() { effects += "G"; return stored; },
  set(next) { effects += "S"; stored = next + 10; },
  enumerable: true,
});
effects = "";
console.log(accessors.item &&= value(4), stored, effects);
effects = "";
console.log(accessors.item ||= value(5), stored, effects);
effects = "";
console.log(accessors.item &&= value(6), stored, effects);
