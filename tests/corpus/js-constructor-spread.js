class Value {
  constructor(first = 2, ...remaining) { this.first = first; this.remaining = remaining; }
}
function make(Constructor, values) { return new Constructor(...values); }
const first = make(Value, [3, 4, 5]);
console.log(first.first, first.remaining.join(","));
console.log(make(Value, []).first, make(Value, [undefined]).first);
const events = [];
function constructor() { events.push("constructor"); return Value; }
function* values() { events.push("first"); yield 7; events.push("last"); yield 8; }
const second = new (constructor())(...values(), 9);
console.log(second.first, second.remaining.join(","), events.join(","));
class Coordinates {
  *[Symbol.iterator]() { yield 10; yield 11; }
}
console.log(make(Value, new Coordinates()).remaining[0]);
try { make(Value, { 0: 1, length: 1 }); } catch (error) { console.log(error.name); }
try { make({}, [1]); } catch (error) { console.log(error.name); }
class Documented {
  /** @param {boolean} [flag=false] */
  constructor(flag = false) { this.flag = flag; }
}
const object = { value: 7 };
console.log(make(Documented, [object]).flag === object, make(Documented, []).flag, make(Documented, [undefined]).flag);
