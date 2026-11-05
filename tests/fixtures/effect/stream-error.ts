import { Effect, Stream, Chunk } from "effect";
const s = Stream.catchAll(Stream.fail("bad"), (s: string) => Stream.succeed("caught:" + s));
Effect.runPromise(Stream.runCollect(s)).then((c) => console.log(Chunk.toReadonlyArray(c).join(",")));
