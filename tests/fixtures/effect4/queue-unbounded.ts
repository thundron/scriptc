import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
Effect.runPromise((Effect.gen(function* () { const q=yield* Queue.unbounded<number>(); yield* Queue.offer(q,42); const n=yield* Queue.take(q); yield* Queue.shutdown(q); return n; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
