class Parser {
  value = 3;
  options = this.setOptions;
  setOptions(value) { this.value = value; return this; }
  otherOptions(value) { this.value = value + 10; return this; }
  constant() { return 12; }
  describe(prefix = "parser") { return `${prefix}:${this.value}`; }
  countArgs(first) { return arguments.length; }
  join(prefix, ...parts) { return prefix + parts.join(":"); }
  fail() { throw new Error("method failed"); }
}
const parser = new Parser();
console.log(parser.options(4) === parser, parser.value);
const second = new Parser();
second.options = parser.options;
console.log(second.options(7) === second, second.value, parser.value);
console.log(parser.options === parser.setOptions, parser.options === second.options);
const detached = parser.options;
try { detached(5); } catch (error) { console.log(error.name); }
const constant = parser.constant;
console.log(constant());
function call(method, receiver, ...args) { return method.apply(receiver, args); }
console.log(call(parser.describe, second), call(parser.describe, second, "other"));
console.log(call(parser.countArgs, undefined, 1, 2, 3), call(parser.join, parser, "parts:", 1, "two"));
try { call(parser.fail, second); } catch (error) { console.log(error.message); }
console.log(call(parser.describe, parser));
console.log(parser.describe.call(second, "called"));
console.log(parser.describe.apply(second, ["applied"]));
const bound = parser.describe.bind(second, "bound");
console.log(bound(), bound.call(parser), bound.bind(parser)());
const restBound = parser.join.bind(parser, "bound:", 1);
console.log(restBound("two", 3));
try { parser.fail.bind(parser)(); } catch (error) { console.log(error.message); }
console.log(bound());
function bindAgain(method, receiver) { return method.bind(receiver, "indirect"); }
console.log(bindAgain(parser.describe, second)());
let effects = "";
function receiver() { effects += "receiver;"; return parser; }
function argument() { effects += "argument;"; parser.options = second.otherOptions; return 9; }
console.log(receiver().options(argument()) === parser, effects, parser.value);
const dynamic = { first: 17, method: function() { return this.first; }, nested: function() { return detached(1); } };
function invoke(object) { return object.method(); }
console.log(invoke(dynamic));
try { dynamic.nested(); } catch (error) { console.log(error.name); }
console.log(invoke(dynamic));

class Base {
  value = 10;
  method() { return `base:${this.value}`; }
  inherited() { return this.value; }
}
class Derived extends Base {
  method() { return `derived:${this.value}`; }
}
class Further extends Derived {
  method() { return `further:${this.value}`; }
}
/** @type {Base} */
const baseView = new Derived();
const derived = new Derived();
const base = new Base();
const selected = baseView.method;
console.log(selected === derived.method, selected === base.method);
console.log(call(selected, derived), call(base.method, derived), call(baseView.inherited, derived));
const further = new Further();
console.log(call(selected, further), further.method());

class Left {
  value = "left";
  leftOnly = true;
  /** @type {*} */
  callback;
  read(suffix) { return this.value + suffix; }
  constructor() { this.callback = this.read; }
}
class Right {
  value = "right";
  rightOnly = true;
  /** @type {*} */
  callback;
  read(suffix) { return this.value + suffix; }
  constructor() { this.callback = this.read; }
}
const left = new Left();
const right = new Right();
let selectedCalls = 0;
function select(rightArm) { selectedCalls++; return rightArm ? right : left; }
function replace() { left.callback = () => "replacement"; return "!"; }
console.log(select(false).callback(replace()), selectedCalls);
console.log(select(true).callback("?"), selectedCalls);
console.log(select(false).callback("ignored"), selectedCalls);
