function apply(value, operations) {
  for (const operation of operations) value = operation(value);
  return value;
}
function make(label) {
  return class Counter {
    static count = 0;
    static label = label;
    static empty;
    static get description() { return this.label + ":" + this.count; }
    static increment() { this.count += 1; return this.description; }
    static pipe() { return apply(this, arguments); }
    static [Symbol.iterator]() { return [label][Symbol.iterator](); }
  };
}
const Left = make("left"), Right = make("right");
console.log(Left.increment(), Left.increment(), Right.increment());
console.log(Left.description, Right.description, Left.empty);
console.log(Left[Symbol.iterator]().next().value);
class Child extends make("child") {}
console.log(Child.increment(), Child.description);
console.log("label" in Child, Object.hasOwn(Child, "count"));
console.log(Child.pipe((Type) => Type.label), Left.pipe((Type) => Type.description));
