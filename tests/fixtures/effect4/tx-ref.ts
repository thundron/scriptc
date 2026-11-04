import * as Effect from "effect/Effect"
import * as TxRef from "effect/TxRef"
Effect.runPromise((Effect.gen(function*(){const r=yield* TxRef.make(40);yield* TxRef.update(r,n=>n+2);return yield* TxRef.get(r)}).pipe(Effect.tx)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
