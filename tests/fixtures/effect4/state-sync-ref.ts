import * as Effect from "effect/Effect"
import * as SynchronizedRef from "effect/SynchronizedRef"
Effect.runPromise((Effect.gen(function* () { const r=yield* SynchronizedRef.make(40); yield* SynchronizedRef.updateEffect(r,n=>Effect.succeed(n+2)); return yield* SynchronizedRef.get(r); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
