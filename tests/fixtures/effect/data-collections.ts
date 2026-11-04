import { Chunk, HashMap, HashSet, Option } from "effect";
console.log(Chunk.toReadonlyArray(Chunk.map(Chunk.make(1, 2), (n: number) => n * 2)).join(","));
console.log(Option.getOrElse(HashMap.get(HashMap.make(["a", 42]), "a"), () => 0));
console.log(HashSet.has(HashSet.make("a", "b"), "b"));
