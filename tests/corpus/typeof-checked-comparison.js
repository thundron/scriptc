function compare(left, right) {
  const type = typeof left;
  console.log(type === typeof right, typeof left !== typeof right, typeof right === type);
}
compare("a", "b");
compare(1, false);
compare(null, []);
compare({}, function () {});
compare(1n, Symbol("one"));
compare(undefined, undefined);
let sequence = "";
function value() { sequence += "value;"; return 2; }
function expected() { sequence += "expected;"; return "number"; }
function evaluate(fn, type) {
  console.log(typeof fn() === type());
  console.log(type() !== typeof fn());
}
evaluate(value, expected);
console.log(sequence);
