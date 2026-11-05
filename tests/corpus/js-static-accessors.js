let reads = 0;
class Constants {
  // @ts-expect-error JavaScript installs accessors before static field initializers.
  static first = this.description;
  static count = 1;
  static get kind() { reads++; return "constant"; }
  static get description() { return this.kind + ":" + this.count; }
  static get value() { return this.count; }
  static set value(value) { this.count = value; }
  static increment() { this.value++; return this.description; }
}
console.log(Constants.first, Constants.kind, Constants.kind, reads);
console.log(Constants.increment(), Constants.value);
class Child extends Constants {}
Child.value = 4;
console.log(Child.description, Constants.description, Object.hasOwn(Child, "count"));
const Type = Child;
console.log(Type.value, Type.increment(), Constants.value);
const Named = class {
  static get name() { return "named"; }
};
console.log(Named.name, Named.name);
const order = [];
function key(name) { order.push(name); return name; }
class Ordered {
  // @ts-expect-error JavaScript evaluates computed field names at runtime.
  static [key("first")] = (order.push("initialize"), 2);
  static get [key("read")]() { return this.first; }
  static { order.push("block"); }
}
console.log(order.join(","), Ordered.read);
