import { Effect } from "effect";
Effect.runPromise(Effect.race(Effect.succeed(42), Effect.never)).then((n: number) => console.log(n));
