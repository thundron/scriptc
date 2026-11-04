import { Effect, FiberRef } from "effect";
const p = Effect.scoped(Effect.gen(function* () { const r = yield* FiberRef.make(1); const a = yield* Effect.locally(FiberRef.get(r), r, 42); const b = yield* FiberRef.get(r); console.log(a, b); }));
Effect.runPromise(p);
