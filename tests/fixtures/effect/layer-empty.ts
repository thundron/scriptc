import { Effect, Layer } from "effect";
Effect.runPromise(Effect.provide(Effect.succeed(42), Layer.empty)).then((n: number) => console.log(n));
