const tag = Symbol.for("local.prototype.tag");
function make(label) {
  class Local {
    value = 3;
    read() { return label; }
  }
  Object.assign(Local.prototype, { label, [tag]: "symbol:" + label });
  const value = new Local();
  return value;
}
function read(value) {
  const object = value;
  console.log(object.label, object[tag], object.value);
}
const first = make("one");
const second = make("two");
read(first);
read(second);

function fromGetter() {
  class Local { value = 7; }
  const source = { marker: "getter", get copied() { console.log(this.marker); return "copied"; } };
  Object.assign(Local.prototype, source);
  return new Local();
}
const withGetter = fromGetter();
console.log(withGetter.copied);
function unpack(value) { return value[tag]; }
console.log(unpack({ [tag]: 31 }));
