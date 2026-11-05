import { Effect } from "effect";
Effect.runPromise(Effect.tap(Effect.succeed(42), (n: number) => Effect.sync(() => console.log("tap", n)))).then((n: number) => console.log(n));
