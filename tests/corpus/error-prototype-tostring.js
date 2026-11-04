function make(label) {
  class LocalError extends Error {}
  Object.assign(LocalError.prototype, {
    toString() { return label + ":" + this.message; }
  });
  return new LocalError("message");
}
const first = make("one");
const second = make("two");
function print(value) {
  console.log(value instanceof Error, String(value));
  console.log(value.toString());
  const method = value.toString;
  console.log(method.call(value));
}
print(first);
print(second);
class Plain extends Error {}
const original = new Plain("original");
const saved = original.toString;
Object.assign(Plain.prototype, { toString() { return "changed:" + this.message; } });
console.log(original.toString());
console.log(saved.call(original));
print(original);
