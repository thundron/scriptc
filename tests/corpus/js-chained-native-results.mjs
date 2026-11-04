const Vector = class Vector {
  constructor(x = 0) { this.x = x; }
  copy(value) { this.x = value.x; return this; }
  add(value) { this.x += value.x; return this; }
};
let calls = 0;
function make() { calls++; return new Vector(); }
const result = make().copy(new Vector(2)).add(new Vector(3));
console.log(result.x, calls);
console.log(make().copy(result).add(result).x, calls);
