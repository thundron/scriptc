class Base {
  constructor() { this.base = 1; }
  read(key) { return this[key]; }
  write(key, value) { this[key] = value; }
  named() { return this.extra; }
  attach(value) { this.extra = value; }
  remember(key, value) {
    if (this.cache === undefined) this.cache = {};
    this.cache[key] = value;
  }
  recall(key) { return this.cache[key]; }
  saved() {
    const cache = this.cache;
    if (cache === undefined) return 'empty';
    return Object.keys(cache).join(',');
  }
}
class Child extends Base {
  constructor() { super(); this.extra = 2; this.storage = 3; }
  get doubled() { return this.storage * 2; }
  set doubled(value) { this.storage = value / 2; }
}
class Leaf extends Child {
  constructor() { super(); this.leaf = 4; }
  get doubled() { return this.storage * 3; }
  set doubled(value) { this.storage = value / 3; }
}
const base = new Base(), child = new Child(), leaf = new Leaf();
console.log('absent', base.read('extra'), Object.keys(base).join(','));
base.attach({answer: 42});
console.log('added', base.read('extra').answer, Object.keys(base).join(','));
console.log('inherited', child.read('extra'), child.named(), leaf.read('leaf'));
child.write('extra', 9); leaf.write('leaf', 10);
child.write('doubled', 12); leaf.write('doubled', 12);
console.log('writes', child.extra, leaf.leaf, child.storage, leaf.storage);
console.log('accessors', child.read('doubled'), leaf.read('doubled'));
let order = '';
function receiver() { order += 'r'; return leaf; }
function key() { order += 'k'; return 'leaf'; }
console.log('read', receiver()[key()], order);
base.remember('first', 1); base.remember('second', {value: 2});
console.log('cache', base.recall('first'), base.recall('second').value, Object.keys(base.cache).join(','));
console.log('saved', base.saved(), child.saved());
