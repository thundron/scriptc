import * as Effect from "effect/Effect"
import * as TxDeferred from "effect/TxDeferred"
Effect.runPromise((Effect.gen(function*(){const d=yield* TxDeferred.make<number>();yield* TxDeferred.succeed(d,42);return yield* TxDeferred.await(d)}).pipe(Effect.tx)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
