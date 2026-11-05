import { Effect } from "effect";
Effect.runPromise(Effect.gen(function* () { yield* Effect.yieldNow(); return 42; })).then((n: number) => console.log(n));
