class Coordinates {
  constructor(x, y) { this.x = x; this.y = y; }
  *[Symbol.iterator]() { yield this.x; yield this.y; }
}
function collect(value) {
  return ((...values) => values.join(","))(0, ...value, 3);
}
console.log(collect(new Coordinates(1, 2)));
console.log(collect([4, 5]));
console.log(collect("😀a"));
let steps = 0;
class Broken {
  *[Symbol.iterator]() { steps++; yield 1; steps++; throw new Error("iteration"); }
}
try { collect(new Broken()); } catch (error) { console.log(error.message, steps); }
try { collect({ length: 2, 0: 1, 1: 2 }); } catch (error) { console.log(error.name); }
