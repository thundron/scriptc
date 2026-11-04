export function identity(value) { return value; }

export function changeMap(map) {
  const iterator = map.entries();
  console.log(iterator.next().value.join(":"));
  map.set("second", 2);
  console.log(iterator.next().value.join(":"));
  console.log(map.has(1), map.get(1), map.delete(1));
  map.forEach((value, key, same) => console.log(key, value, same === map));
  console.log(map.delete("first"), iterator.next().done);
}

export function changeSet(set) {
  const iterator = set.values();
  console.log(iterator.next().value);
  set.add("second");
  console.log(iterator.next().value, set.has(1), set.delete(1));
  set.forEach((value, key, same) => console.log(value, key, same === set));
  console.log(set.delete("first"), iterator.next().done);
}
