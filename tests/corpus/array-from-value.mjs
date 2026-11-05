const from = Array.from;
console.log(from.length, from.name);
console.log(from === Array.from, JSON.stringify(from("a😀b")));
console.log(JSON.stringify(from([1, 2], (value, index) => value + index)));
const receiver = { offset: 10 };
console.log(JSON.stringify(from([1, 2], function (value) { return this.offset + value; }, receiver)));
const source = { 0: "a", 1: "b", length: 2 };
console.log(JSON.stringify(from(source, (value, index) => {
  if (index === 0) source[1] = "changed";
  return value;
})));
let closed = 0;
function* values() {
  try { yield 1; yield 2; } finally { closed++; }
}
try { from(values(), () => { throw new Error("mapper"); }); }
catch (error) { console.log(error.message, closed); }
try { from([], 1); } catch (error) { console.log(error.name); }
