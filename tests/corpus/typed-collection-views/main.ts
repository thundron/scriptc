import { changeMap, changeSet, identity } from "./use.mjs";

const map = new Map<string, number>([["first", 1]]);
changeMap(map);
console.log(map.size, map.get("second"), identity(map) === map);
const restored = identity(map) as Map<string, number>;
restored.set("third", 3);
console.log(map.get("third"));

const set = new Set<string>(["first"]);
changeSet(set);
console.log(set.size, set.has("second"), identity(set) === set);
const restoredSet = identity(set) as Set<string>;
restoredSet.add("third");
console.log(set.has("third"));
