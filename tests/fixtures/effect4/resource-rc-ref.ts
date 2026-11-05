import * as Effect from "effect/Effect"
import * as RcRef from "effect/RcRef"
Effect.runPromise((Effect.gen(function*(){const r=yield* RcRef.make({acquire:Effect.succeed(42),idleTimeToLive:"1 minute"});return yield* RcRef.get(r)}).pipe(Effect.scoped)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
