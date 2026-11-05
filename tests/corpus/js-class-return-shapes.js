// JavaScript virtual calls and inherited accessors retain their runtime return shapes.
// @ts-nocheck
class Base {
  method(value = 1) { return value; }
  dispatch(value) { return this.method(value); }
  get value() { return 1; }
  read() { return this.value; }
}
class Text extends Base {
  method(value = "default") { return String(value); }
  get value() { return "text"; }
}
class Empty extends Base {
  method() {}
  get value() { return undefined; }
}
class RecordValue extends Base {
  method(value) { return { value }; }
  get value() { return { count: 3 }; }
}
function wrapper(value, argument) { return value.dispatch(argument); }
function accessor(value) { return value.read(); }
console.log(wrapper(new Base(), 2), wrapper(new Text(), 3), wrapper(new Empty(), 4));
console.log(JSON.stringify(wrapper(new RecordValue(), "four")));
console.log(accessor(new Base()), accessor(new Text()), accessor(new Empty()));
console.log(JSON.stringify(accessor(new RecordValue())));

// A helper can select a deferred constructor callback or its final instance.
class NodeValue {
  constructor(value) { this.value = value; }
}
function nodeOrFactory(deferred, value) {
  return deferred ? child => new NodeValue(child) : new NodeValue(value);
}
const factory = nodeOrFactory(true, 0);
console.log(factory(7).value, nodeOrFactory(false, 8).value);
