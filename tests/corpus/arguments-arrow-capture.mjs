function dual(predicate, body) {
  return function () {
    if (predicate(arguments)) return body.apply(this, arguments);
    return (self) => body(self, ...arguments);
  };
}
const add = dual((args) => args.length === 2, (a, b) => a + b);
const addTwo = add(2);
console.log(add(20, 22), addTwo(40));
function nested(value) {
  return () => () => arguments[0] + value;
}
console.log(nested(21)()());
function owners() {
  return function (other) {
    return () => arguments[0];
  };
}
console.log(owners("outer")("inner")());
