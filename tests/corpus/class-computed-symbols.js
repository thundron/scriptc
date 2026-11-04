const data = Symbol.for("computed.data");
const method = Symbol.for("computed.method");
const absent = Symbol("absent");
class Base {
  [data] = 7;
  [method](amount) { return this[data] + amount; }
}
class Child extends Base {
  [method](amount) { return this[data] * amount; }
}
function probe(value, key) {
  console.log(key in value, Object.hasOwn(value, key), Object.prototype.propertyIsEnumerable.call(value, key));
}
function read(value, key) { return value[key]; }
function write(value, key, stored) { value[key] = stored; }
function invoke(value, key, amount) { return value[key](amount); }
const base = new Base();
const child = new Child();
probe(base, data);
probe(base, method);
probe(child, data);
probe(child, method);
probe(child, absent);
console.log(read(base, data), invoke(base, method, 3), invoke(child, method, 3));
write(child, data, 11);
console.log(read(child, data), invoke(child, method, 3));
write(child, absent, "added");
console.log(read(child, absent));
probe(child, absent);
