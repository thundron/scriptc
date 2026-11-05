import { Effect, Stream, Chunk, pipe } from "effect";
const s = pipe(Stream.fromEffect(Effect.succeed(21)), Stream.mapEffect((n: number) => Effect.succeed(n * 2)));
Effect.runPromise(Stream.runCollect(s)).then((c) => console.log(Chunk.toReadonlyArray(c).join(",")));
