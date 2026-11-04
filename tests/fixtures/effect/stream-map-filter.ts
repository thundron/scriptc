import { Effect, Stream, Chunk, pipe } from "effect";
const s = pipe(Stream.fromIterable([1, 2, 3]), Stream.map((n: number) => n * 2), Stream.filter((n: number) => n > 2));
Effect.runPromise(Stream.runCollect(s)).then((c) => console.log(Chunk.toReadonlyArray(c).join(",")));
