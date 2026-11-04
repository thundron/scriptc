import * as Effect from "effect/Effect"
import * as RcMap from "effect/RcMap"
Effect.runPromise((Effect.gen(function*(){const m=yield* RcMap.make({lookup:(key:string)=>Effect.succeed(key.length),idleTimeToLive:"1 minute"});return yield* RcMap.get(m,"world")}).pipe(Effect.scoped)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
