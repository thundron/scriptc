import * as Effect from "effect/Effect"
import * as Semaphore from "effect/Semaphore"
Effect.runPromise((Effect.gen(function* () { const s=yield* Semaphore.make(1); return yield* Effect.all([1,2,3].map(n=>Semaphore.withPermit(s,Effect.succeed(n))),{concurrency:3}); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
