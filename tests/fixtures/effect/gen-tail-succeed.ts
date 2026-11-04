import { Effect } from "effect";
Effect.runPromise(Effect.gen(function* () { return yield* Effect.succeed(42); })).then((n: number) => console.log(n));
