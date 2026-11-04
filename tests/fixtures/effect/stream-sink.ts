import { Effect, Stream, Sink } from "effect";
Effect.runPromise(Stream.run(Stream.fromIterable([1, 2, 3]), Sink.sum)).then((n: number) => console.log(n));
