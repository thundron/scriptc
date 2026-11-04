import * as Effect from "effect/Effect"
import * as TxHashMap from "effect/TxHashMap"
import * as Option from "effect/Option"
Effect.runPromise((Effect.gen(function*(){const m=yield* TxHashMap.make(["key",42]);const v=yield* TxHashMap.get(m,"key");return Option.getOrElse(v,()=>0)}).pipe(Effect.tx)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
