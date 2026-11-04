function make(key) {
  /** @constructor */
  function Base() { this.value = key; }
  Base.key = key;
  Object.setPrototypeOf(Base, {
    get label() { return this.key + "!"; },
    *[Symbol.iterator]() { yield this.key; },
  });
  return Base;
}
class Left extends make("left") {}
class Right extends make("right") {}
function read(Type) {
  console.log(Type.key, Type.label);
  console.log(Type[Symbol.iterator]().next().value);
}
read(Left);
read(Right);
