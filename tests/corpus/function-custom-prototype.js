const marker = Symbol("marker");
function make(key) {
  function Tag() {}
  const proto = {
    label: "tag",
    [marker]: "marked",
    get description() { return this.key + ":" + this.label; },
    show() { return this.key; }
  };
  console.log(Object.setPrototypeOf(Tag, proto) === Tag);
  Tag.key = key;
  Object.defineProperty(Tag, "stack", { get() { return key + ":stack"; } });
  return Tag;
}
const a = make("a");
const b = make("b");
console.log(a.key, b.key, a.description, a.show(), a[marker], a.stack);
console.log(Object.getPrototypeOf(a) === Object.getPrototypeOf(b), Object.getPrototypeOf(a).label);
console.log(a.prototype.constructor === a, a.name, a.length, Object.keys(a).join(","));
console.log(Object.setPrototypeOf(a, null) === a, Object.getPrototypeOf(a) === null);
console.log(a.label, a[marker], a.key, a.prototype.constructor === a);
try { Object.setPrototypeOf(b, b); } catch (error) { console.log(error.name, error.message); }
