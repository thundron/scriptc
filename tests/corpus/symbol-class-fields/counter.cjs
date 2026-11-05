const countKey = Symbol.for("scriptc.counter");
const sameCount = Symbol.for("scriptc.counter");
class Counter {
  constructor() {
    this[countKey] = 1;
  }
  bump() {
    this[sameCount] += 1;
    return this[sameCount];
  }
}
module.exports = { Counter, countKey };
