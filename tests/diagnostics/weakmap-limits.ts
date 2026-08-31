class Key {
  id: number;
  constructor(id: number) { this.id = id; }
}

const generic = new WeakMap<object, number>();
const objectValue = new WeakMap<Key, Key>();
const seededKey = new Key(1);
const seeded = new WeakMap<Key, number>([[seededKey, 1]]);

console.log(generic, objectValue, seeded);
