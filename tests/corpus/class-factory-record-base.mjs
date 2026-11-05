class YieldableError extends Error {}
const Failure = (function () {
  const key = Symbol("args");
  const named = {
    BaseFailure: class extends YieldableError {
      constructor(args) {
        super(args.message);
        Object.assign(this, args);
        Object.defineProperty(this, key, { value: args });
      }
    },
  };
  return named.BaseFailure;
})();
function tagged(tag) {
  const named = { TaggedFailure: class extends Failure { _tag = tag; } };
  named.TaggedFailure.prototype.name = tag;
  return named.TaggedFailure;
}
class Rejected extends tagged("Rejected") {}
const error = new Rejected({ message: "invalid", detail: 42 });
console.log(error.name, error.message, error.detail, error._tag, error instanceof Error);
console.log(error.toString(), Object.hasOwn(error, "name"));
error.name = "Custom";
console.log(error.name, error.toString(), Object.hasOwn(error, "name"));
console.log(Object.prototype.propertyIsEnumerable.call(error, "name"));
const other = new Rejected({ message: "next" });
console.log(other.name, other.toString(), Object.hasOwn(other, "name"));
