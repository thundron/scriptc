class Base {
  visit() { console.log("base"); }
  dispatch(first, second, third) { this.visit(first, second, third); }
}
class Pair extends Base {
  visit(first, second) { console.log("pair", first, second); }
}
class Triple extends Pair {
  visit(first, second, third) { console.log("triple", first, second, third); }
  parent(first, second) { super.visit(first, second); }
}
class Short extends Base {
  visit(first) { console.log("short", first); }
}
function value(n) { console.log("arg", n); return n; }
for (const object of [new Base(), new Pair(), new Triple(), new Short()]) {
  object.dispatch(value(1), value(2), value(3));
  object.visit();
}
new Triple().parent(4, 5);
const method = new Pair().visit;
method(6, 7);
