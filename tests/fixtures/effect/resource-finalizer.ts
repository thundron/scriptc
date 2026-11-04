import { Effect } from "effect";
const p = Effect.scoped(Effect.gen(function* () { yield* Effect.addFinalizer(() => Effect.sync(() => console.log("finalizer"))); return 42; }));
Effect.runPromise(p).then((n: number) => console.log(n));
