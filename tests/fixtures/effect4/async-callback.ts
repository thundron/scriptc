import * as Effect from "effect/Effect"
Effect.runPromise((Effect.callback<number>(resume=> { setTimeout(()=>resume(Effect.succeed(42)),1) })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
