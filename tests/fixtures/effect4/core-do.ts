import * as Effect from "effect/Effect"
Effect.runPromise((Effect.Do.pipe(Effect.bind("n", () => Effect.succeed(21)), Effect.let("doubled", ({n}) => n*2))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
