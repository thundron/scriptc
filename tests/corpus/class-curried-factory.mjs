function Base(props) { Object.assign(this, props); }
const makeClass = ({ Base, label }) => {
  const key = Symbol.for(label);
  const Result = class extends Base {
    constructor(props) { super(props); }
    get [key]() { return label; }
  };
  Object.defineProperty(Result.prototype, "describe", {
    value() { return label + ":" + this.value; },
    configurable: true,
    writable: true,
  });
  return Result;
};
const factory = label => () => makeClass({ Base, label });
class First extends factory("first")() {}
class Second extends factory("second")() {}
const first = new First({ value: 42 });
const second = new Second({ value: 7 });
console.log(first.describe(), second.describe());
console.log(first[Symbol.for("first")], second[Symbol.for("second")]);
