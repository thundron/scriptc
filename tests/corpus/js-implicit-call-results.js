const nodeObject = (value, type = null) => value;
const Make = function (NodeClass, settings = null) {
  function assignNode(node) {
    if (settings !== null) node = nodeObject(Object.assign(node, settings));
    else node = nodeObject(node);
    return node;
  }
  return (...values) => assignNode(new NodeClass(...values));
};
class Value {
  constructor(value) { this.value = value; }
}
const make = new Make(Value, { intent: true });
const first = make(4);
console.log(first.value, first.intent, first instanceof Value);
const owner = { get() { return first; } };
console.log(nodeObject(owner.get()) === first);
function lineCount(stack) { return stack.split("\n").length; }
class Trace {
  /** @param {Error|string|null} message */
  constructor(message = null) {
    this.lines = lineCount(message ? message : new Error().stack);
  }
}
console.log(new Trace().lines > 0, new Trace("first\nsecond").lines);
try { new Trace(new Error("input")); } catch (error) { console.log(error.name); }
