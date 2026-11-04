import * as Effect from "effect/Effect"
import * as TxSemaphore from "effect/TxSemaphore"
Effect.runPromise((Effect.gen(function*(){const s=yield* TxSemaphore.make(2);yield* TxSemaphore.acquire(s);const a=yield* TxSemaphore.available(s);yield* TxSemaphore.release(s);return [a,yield* TxSemaphore.available(s)]}).pipe(Effect.tx)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
