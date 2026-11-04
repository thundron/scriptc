import { Effect, Stream } from "effect";
Effect.runPromise(Stream.runDrain(Stream.make(1, 2, 3))).then(() => console.log("drained"));
