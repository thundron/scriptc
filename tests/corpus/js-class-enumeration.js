class Base {
  #secret = 9;
  constructor(include) {
    this.first = 1;
    Object.defineProperty(this, "id", { value: 42 });
    if (include) this.optional = undefined;
    this.last = 3;
  }
  method() { return this.first; }
  self() { return this; }
}
Base.prototype.inherited = 7;
Base.prototype.id = "shadowed";
class Child extends Base {
  field = 4;
  constructor(include) {
    super(include);
    this[2] = "two";
    this[1] = "one";
  }
}
function enumerate(value) {
  const keys = [];
  for (const key in value) keys.push(key + ":" + String(value[key]));
  return keys.join(",");
}
console.log(enumerate(new Child(false)));
console.log(enumerate(new Child(true)));
const value = new Child(false);
console.log(Object.keys(value).join(","));
console.log(Object.getOwnPropertyDescriptor(value, "id").enumerable);
console.log(Object.hasOwn(value, "optional"));
value.optional = undefined;
console.log(Object.hasOwn(value, "optional"), Object.keys(value).join(","));
console.log(enumerate(value));
Object.assign(value, { optional: 8, extra: 9 });
console.log(enumerate(value));
Object.assign(value.self(), { field: 6, extra: 10 });
console.log(value.field, enumerate(value));
const direct = [];
for (const key in value) direct.push(key);
console.log(direct.join(","));

class Reentrant {
  constructor() {
    this.first = enumerate(this);
    this.second = enumerate(this);
  }
}
console.log(new Reentrant().second);

// Record capsules retain their declared order and live values through JS calls.
function visit(record) {
  const output = [];
  for (const key in record) output.push(key + ":" + String(record[key]));
  return output.join(",");
}
const record = { z: 3, a: 1 };
console.log(visit(record));
record.a = 2;
console.log(visit(record));
