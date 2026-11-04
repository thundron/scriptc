const hash = Symbol.for("hash");
function cache(self, value) {
  Object.defineProperty(self, hash, { value() { return value; }, enumerable: false });
}
class Key {
  calls = 0;
  [hash]() {
    this.calls++;
    cache(this, 42);
    return 42;
  }
}
function read(value) { return value[hash](); }
function own(value) { return Object.hasOwn(value, hash); }
const key = new Key();
console.log(own(key), read(key), read(key), key.calls, own(key));

// A base constructor observes the instance before derived fields initialize.
// Copying properties must not expose an uninitialized native symbol slot.
const tag = Symbol.for("tag");
class AssignedError extends Error {
  constructor(properties) {
    super();
    Object.assign(this, properties);
  }
}
class TaggedError extends AssignedError {
  [tag] = tag;
}
const failure = new TaggedError({ message: "copied" });
console.log(failure.message, failure[tag] === tag);
