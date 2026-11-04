class Base {
  constructor() { this.value = 1; }
  copy(source) { this.value = source.value; return this; }
  dispatch(source) { return this.copy(source); }
}
class Child extends Base {
  constructor() { super(); this.extra = 2; }
  copy(source) { super.copy(source); this.extra = source.extra; return this; }
  childOnly() { return this.extra; }
}
class Leaf extends Child {
  constructor() { super(); this.leaf = 3; }
  copy(source) {
    super.copy(source);
    if (source.leaf === 0) return (this);
    this.leaf = source.leaf;
    return this;
  }
}
const source = new Leaf();
source.value = 4; source.extra = 5; source.leaf = 6;
const target = new Leaf();
console.log('direct', target.copy(source) === target, target.value, target.extra, target.leaf);
console.log('chain', target.copy(source).childOnly(), target.copy(source).leaf);
source.extra = 8;
console.log('virtual', target.dispatch(source) === target, target.extra);
source.leaf = 0;
console.log('early', target.copy(source) === target, target.leaf);
