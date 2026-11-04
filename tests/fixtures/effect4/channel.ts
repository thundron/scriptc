import * as Effect from "effect/Effect"
import * as Channel from "effect/Channel"
Effect.runPromise((Channel.runCollect(Channel.fromIterable([1,2,3]))).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
