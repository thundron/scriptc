import * as Effect from "effect/Effect"
Effect.runPromise((Effect.promise(() => Promise.resolve(42))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
