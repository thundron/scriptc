const tag = Symbol.for("assign.tag");
const target = value => value + 1;
const assigned = Object.assign(target, {
  label: "first",
  [tag]: "symbol",
  describe() { return this.label + ":" + this[tag]; }
});
console.log(assigned === target, typeof assigned, assigned(5));
console.log(assigned.describe(), assigned[tag]);
const again = Object.assign(target, { label: "second" }, { extra: 9 });
console.log(again === assigned, assigned.describe(), again.extra, again(10));
console.log(Object.keys(assigned).join(","));
function make() {
  const method = Object.assign(value => method.prefix + value, { prefix: "hello:" });
  return method;
}
const first = make();
const second = make();
console.log(first("world"), second("other"), first === second);
