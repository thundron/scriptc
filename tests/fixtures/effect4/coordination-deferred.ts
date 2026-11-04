import * as Effect from "effect/Effect"
import * as Deferred from "effect/Deferred"
import * as Fiber from "effect/Fiber"
Effect.runPromise((Effect.gen(function* () { const d=yield* Deferred.make<number>(); const f=yield* Effect.forkChild(Deferred.await(d)); yield* Deferred.succeed(d,42); return yield* Fiber.join(f); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
