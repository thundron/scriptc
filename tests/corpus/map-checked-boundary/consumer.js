export function useMap(map) {
  console.log(map instanceof Map, map.size, map.get("from typed"));
  console.log(map.set("key", "value") === map);
  map.set(NaN, "nan");
  map.set(undefined, undefined);
  map.set(-0, "zero");
  console.log(map.has(NaN), map.get(0), map.has("absent"));
  console.log(map.delete(0), map.delete(0), map.get(0));
}

export function copyMap(map) {
  const copy = new Map(map);
  console.log(copy.size, copy.get("key"), copy.get(NaN), copy.has(undefined));
  copy.delete("key");
  console.log(map.has("key"), copy.has("key"));
  const object = {};
  map.set(object, object);
  const shallow = new Map(map);
  console.log(shallow.has(object), shallow.get(object) === object);
  map.delete(object);
}
