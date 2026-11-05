class Base {
  constructor(value) { this.value = value; }
  read() { return this.value; }
}
class Child extends Base {
  read() { return this.value + 10; }
}
function extract(value) { return value.read; }
const base = new Base(1);
const first = extract(base);
const child = new Child(2);
const second = extract(child);
console.log(first.call(child), second.call(base), second === child.read);
const dynamic = JSON.parse('{}');
dynamic.base = base;
dynamic.child = child;
const methodName = JSON.parse('"read"');
console.log(dynamic.base[methodName].call(child), dynamic.child[methodName].call(base));
class Holder {
  constructor() { this.child = null; }
  attach(value) { this.child = value; }
  extract() { return this.child.read; }
}
const holder = new Holder();
holder.attach(child);
console.log(Boolean(holder.child && holder.child.read), holder.extract().call(base));
child.read = function () { return this.value + 100; };
console.log(holder.extract().call(child));
