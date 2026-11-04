// Checked-dynamic holders keep identity, and each key is read at visit
// time. Added keys are not visited by an already-started object walk.
const input = JSON.parse('{"a":1,"b":2}');
const seen = [];
const output = JSON.stringify(input, function (key, value) {
  seen.push(key + ":" + (this[key] === value));
  if (key === "a") {
    this.b = 20;
    this.newKey = 30;
  }
  return value;
});
console.log(output, seen.join("|"), input.b, input.newKey);

const visits = [];
const revived = JSON.parse('{"a":1,"b":2}', function (key, value) {
  visits.push(key + ":" + (this[key] === value));
  if (key === "a") {
    this.b = 40;
    this.extra = 50;
  }
  return typeof value === "number" ? value + 1 : value;
});
console.log(JSON.stringify(revived), visits.join("|"));

const nested = JSON.parse('{"x":{"a":1,"b":2}}');
console.log(JSON.stringify(nested, function (key, value) {
  if (key === "a") {
    const old = this;
    JSON.parse('{"inner":1}', function (innerKey, innerValue) {
      if (innerKey === "inner") this.inner = 9;
      return innerValue;
    });
    console.log(this === old, this.b);
  }
  return value;
}));

console.log(JSON.stringify(JSON.parse("[1,2]", null)));
console.log(JSON.stringify({ n: 1 }, (key, value) => value, null));
