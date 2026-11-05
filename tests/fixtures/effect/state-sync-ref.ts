import { Effect, SynchronizedRef } from "effect";
const p = Effect.gen(function* () { const r = yield* SynchronizedRef.make(20); yield* SynchronizedRef.updateEffect(r, (n: number) => Effect.succeed(n + 22)); return yield* SynchronizedRef.get(r); });
Effect.runPromise(p).then((n: number) => console.log(n));
