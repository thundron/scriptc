class Empty {
  kind = "empty";
}
class Value {
  kind = "value";
  constructor(value) { this.value = value; }
}
function read(value = new Empty()) { return value.kind; }
function invoke(fn, value) { return fn(value); }
console.log(read(), invoke(read, new Value(42)), invoke(read, undefined));
