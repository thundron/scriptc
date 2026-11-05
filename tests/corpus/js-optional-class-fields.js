class Vector {
  constructor() { this.x = 1; this.y = 2; }
  get doubled() { return this.x * 2; }
  set doubled(value) { this.x = value / 2; }
}
class Holder {
  initialize() { this.vector = new Vector(); }
}
const holder = new Holder();
holder.initialize();
let calls = 0;
function receiver() { calls++; return holder; }
receiver().vector.x = 7;
holder.vector.y += 3;
holder.vector.doubled = 18;
console.log('nested', holder.vector.x, holder.vector.y, calls);

class Positioned {
  constructor() { Object.defineProperty(this, 'position', {value: new Vector(), enumerable: true}); }
}
const objects = [new Positioned()];
console.log('array', objects[0].position.x);
objects[0].position.x = 4;
console.log('write', objects[0].position.x);
try { console.log(objects[1].position.x); }
catch (error) { console.log('missing', error instanceof TypeError, error.message); }
