import * as Effect from "effect/Effect"
import * as TxRef from "effect/TxRef"
Effect.runPromise((Effect.gen(function* () { const r=yield* TxRef.make(1); yield* Effect.gen(function*(){yield* TxRef.set(r,2);return yield* Effect.fail("rollback")}).pipe(Effect.tx,Effect.catch(()=>Effect.void)); return yield* TxRef.get(r); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
