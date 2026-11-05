import * as Effect from "effect/Effect"
Effect.runPromise((Effect.forEach([1,2,3], n => Effect.succeed(n*2))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
