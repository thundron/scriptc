import { useMap, copyMap } from "./consumer.js";

const map = new Map<unknown, unknown>();
const boxed: unknown = map;
console.log(boxed instanceof Map, String(boxed));
useMap(boxed);
copyMap(boxed);
console.log(map.size, map.get("key"), map.get(NaN), map.has(undefined));
const restored = boxed as Map<unknown, unknown>;
console.log(restored === map);
restored.set("from typed", 123);
useMap(boxed);
map.clear();
console.log(map.size);
