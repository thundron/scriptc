class Value {
  constructor(x = 1) { this.x = x; }
  clone() { return new this.constructor(this.x); }
  reset() { return new this.constructor(); }
}
class Child extends Value {
  constructor(x = 2, extra = 3) { super(x); this.extra = extra; }
}
class Leaf extends Child {}
const a = new Value(4), b = new Child(5), c = new Leaf(6);
for (const source of [a, b, c]) {
  const copy = source.clone();
  console.log(copy !== source, copy.x, copy instanceof Value, copy instanceof Child, copy instanceof Leaf);
  console.log(source.reset().x);
}
let order = '';
function receiver() { order += 'r'; return b; }
function argument() { order += 'a'; return 7; }
const selected = new (receiver().constructor)(argument());
console.log(order, selected.x, selected instanceof Child);
class Other { constructor(x = 9) { this.x = x; } }
/** @returns {Value | Other} */
function choose(flag) { return new (flag ? Value : Other)(argument()); }
console.log(choose(true).x, choose(false).x, order);
