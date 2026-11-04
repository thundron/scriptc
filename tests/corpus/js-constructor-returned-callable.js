const Make = function (prefix, initial = 1) {
  return (...values) => prefix + ":" + (initial + values.reduce((sum, value) => sum + value, 0));
};
const add = new Make("sum", 2);
console.log(add(3, 4), add());
function Container(value) { return {value}; }
console.log(new Container(5).value);
function Label(value) { return () => value; }
console.log(new Label("hello")());
