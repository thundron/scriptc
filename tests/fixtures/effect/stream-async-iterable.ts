import { Effect, Stream, Chunk } from "effect";
async function* values() { yield 1; yield 2; }
const s = Stream.fromAsyncIterable(values(), (e) => String(e));
Effect.runPromise(Stream.runCollect(s)).then((c) => console.log(Chunk.toReadonlyArray(c).join(",")));
