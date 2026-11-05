import { Chunk } from "effect";
console.log(Chunk.toReadonlyArray(Chunk.map(Chunk.make(1, 2), (n: number) => n * 2)).join(","));
