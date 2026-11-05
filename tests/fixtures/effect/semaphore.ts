import { Effect } from "effect";
const p = Effect.gen(function* () { const s = yield* Effect.makeSemaphore(1); return yield* s.withPermits(1)(Effect.succeed(42)); });
Effect.runPromise(p).then((n: number) => console.log(n));
