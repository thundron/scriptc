import * as Effect from "effect/Effect"
Effect.runPromise((Effect.try({try:()=>{throw "bad"},catch:e=>String(e)}).pipe(Effect.mapError(e=>"mapped:"+e), Effect.catch(e=>Effect.succeed(e)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
