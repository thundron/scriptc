import { Effect, Stream, Chunk } from "effect";
Effect.runPromise(Stream.runCollect(Stream.merge(Stream.make(1), Stream.make(2)))).then((c) => console.log([...Chunk.toReadonlyArray(c)].sort().join(",")));
