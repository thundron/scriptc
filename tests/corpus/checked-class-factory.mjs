function make(tag) {
  class Failure extends Error {
    _tag = tag;
  }
  return Failure;
}
const Left = make("Left");
const Right = make("Right");
function construct(Type, message) { return new Type(message); }
const left = construct(Left, "first");
const right = construct(Right, "second");
console.log(left._tag, left.message, right._tag, right.message);
console.log(left instanceof Left, right instanceof Right, left instanceof Right);
