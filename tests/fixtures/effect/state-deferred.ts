import { Effect, Deferred } from "effect";
const p = Effect.gen(function* () { const d = yield* Deferred.make<number>(); yield* Deferred.succeed(d, 42); return yield* Deferred.await(d); });
Effect.runPromise(p).then((n: number) => console.log(n));
