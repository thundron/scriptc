function append(value, suffix) {
  let result = value;
  result += suffix;
  return result;
}
console.log(append("hello", ", world"), append(1, "2"), append(1n, 2n));
function compute(value, rhs) {
  let result = value;
  result *= rhs;
  return result;
}
console.log(compute("6", 7), compute(6n, 7n));
let calls = 0;
const value = { valueOf() { calls++; return 4; } };
console.log(append(value, 2), calls);
