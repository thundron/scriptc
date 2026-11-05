import { Effect } from "effect";
const p = Effect.scoped(Effect.gen(function* () { yield* Effect.addFinalizer(() => Effect.sync(() => console.log("finalizer"))); return yield* Effect.fail("bad"); }));
Effect.runPromise(Effect.exit(p)).then((e) => console.log(e._tag));
