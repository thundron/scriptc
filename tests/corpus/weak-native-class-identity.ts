class Key { value = 1; }
const first = new Key();
const second = new Key();
const map = new WeakMap<object, number>();
const set = new WeakSet<object>();
const value: unknown = first;
console.log(map.set(first, 3) === map, map.get(value as object), map.has(second));
console.log(set.add(first) === set, set.has(value as object), set.has(second));
console.log(map.delete(first), map.has(first), set.delete(first), set.has(first));
