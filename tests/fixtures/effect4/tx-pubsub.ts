import * as Effect from "effect/Effect"
import * as TxPubSub from "effect/TxPubSub"
import * as TxQueue from "effect/TxQueue"
Effect.runPromise((Effect.gen(function*(){const p=yield* TxPubSub.unbounded<number>();const q=yield* TxPubSub.subscribe(p);yield* TxPubSub.publish(p,42);return yield* TxQueue.take(q)}).pipe(Effect.tx,Effect.scoped)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
