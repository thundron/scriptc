const cache = new WeakMap();
const holder = {
  store(key) {
    cache.set(key, "stored");
    return key;
  },
  get(key) { return cache.get(key); }
};
class Tag {
  constructor(name) { this.name = name; }
}
const key = holder.store([new Tag("unit")]);
console.log(holder.get(key), key[0].name, cache.has([new Tag("unit")]));
const nested = holder.store([[new Tag("nested")]]);
console.log(holder.get(nested), nested[0][0].name);
const numbers = holder.store([1, 2, 3]);
console.log(holder.get(numbers), numbers.join(","));
const empty = holder.store([]);
console.log(holder.get(empty), empty.length);
