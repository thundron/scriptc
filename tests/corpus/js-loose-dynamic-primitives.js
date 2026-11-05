function same(left, right) { return left == right; }
function different(left, right) { return left != right; }
for (const pair of [[2, 2], [2, "2"], [false, ""], [null, undefined], [NaN, NaN], [0, false], [1, true], ["x", 1], [undefined, 0]]) {
  console.log(same(pair[0], pair[1]), different(pair[0], pair[1]));
}
const object = { valueOf() { return 3; } };
console.log(same(object, "3"), same(object, object), same(object, {}));
console.log(same(2n, "2"), same(2n, 2), same(2n, 2.5));
console.log(same(Symbol("a"), "a"));
class Radius {
  constructor(value) { this.value = value; }
  changed(value) { const previous = this.value; this.value = value; return previous != this.value; }
}
const radius = new Radius(3);
console.log(radius.changed(3), radius.changed(4), radius.changed("4"));
