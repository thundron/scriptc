import * as Effect from "effect/Effect"
Effect.runPromise((Effect.tryPromise({try:()=>Promise.reject("bad"),catch:e=>String(e)}).pipe(Effect.catch(e=>Effect.succeed(e)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
