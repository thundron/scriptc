import { Effect, Stream, Chunk } from "effect";
const s = Stream.take(Stream.iterate(1, (n: number) => n + 1), 3);
Effect.runPromise(Stream.runCollect(s)).then((c) => console.log(Chunk.toReadonlyArray(c).join(",")));
