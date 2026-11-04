import * as Effect from "effect/Effect"
import * as TxQueue from "effect/TxQueue"
Effect.runPromise((Effect.gen(function*(){const q=yield* TxQueue.unbounded<number>();yield* TxQueue.offer(q,42);return yield* TxQueue.take(q)}).pipe(Effect.tx)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
