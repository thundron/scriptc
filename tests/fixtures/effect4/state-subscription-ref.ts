import * as Effect from "effect/Effect"
import * as SubscriptionRef from "effect/SubscriptionRef"
import * as Stream from "effect/Stream"
Effect.runPromise((Effect.gen(function* () { const r=yield* SubscriptionRef.make(42); return yield* Stream.runCollect(SubscriptionRef.changes(r).pipe(Stream.take(1))); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
