function builder(text) {
  const value = {
    append(part) { text = text + part; return value; },
    read() { return text; }
  };
  return value;
}

const live = builder("live");
function unlink(value) { delete value.self; }
let total = 0;
for (let i = 0; i < 2000; i++) {
  total += builder("x").append("y").read().length;
  const object = Object.create(null);
  object.self = object;
  object.items = [object];
  Object.defineProperty(object, "read", { get: () => object.self, configurable: true });
  if (object.read !== object) throw new Error("identity");
  if (i % 2 === 0) {
    Object.defineProperty(object, "read", { value: "gone", configurable: true });
    object.items[0] = null;
    unlink(object);
  }
  const set = new Set();
  const holder = Object.create(null);
  holder.set = set;
  set.add(holder);
  set.add(set);
}
console.log(total, live.append("!").read());
