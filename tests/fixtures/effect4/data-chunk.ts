import * as Chunk from "effect/Chunk"
console.log(JSON.stringify(Chunk.toReadonlyArray(Chunk.map(Chunk.make(1,2,3),n=>n*2))))
