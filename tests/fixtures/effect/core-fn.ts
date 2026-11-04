import { Effect } from "effect";
const double = Effect.fn("double")(function* (n: number) { return yield* Effect.succeed(n * 2); });
Effect.runPromise(double(21)).then((n: number) => console.log(n));
