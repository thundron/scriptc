class Value {
  constructor(value) { this.value = value; }
  read() { return this.value; }
  write(value) { this.value = value; }
}
class Wrapped extends Value {
  // @ts-expect-error JavaScript dispatch permits an inherited assignment to invoke this accessor.
  get value() { return this.stored; }
  set value(value) { this.stored = value * 2; }
}
const plain = new Value(3);
const wrapped = new Wrapped(4);
console.log(plain.read(), wrapped.read());
wrapped.write(5);
console.log(wrapped.value, wrapped.stored);
class First { configure(value) { this.setting = value; return this; } }
class Second { configure(value) { this.setting = value + 1; return this; } }
class Options {
  constructor(useFirst) {
    if (useFirst) this.handler = new First();
    else this.handler = new Second();
    this.handler.configure(6);
  }
  read() { return this.handler.setting; }
}
console.log(new Options(true).read(), new Options(false).read());
