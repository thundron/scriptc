import { Effect, Deferred, Fiber } from "effect";
const p = Effect.gen(function* () { const d = yield* Deferred.make<number>(); const f = yield* Effect.fork(Deferred.await(d)); yield* Deferred.succeed(d, 42); return yield* Fiber.join(f); });
Effect.runPromise(p).then((n: number) => console.log(n));
