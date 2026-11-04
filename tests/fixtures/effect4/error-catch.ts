import * as Effect from "effect/Effect"
Effect.runPromise((Effect.fail("oops").pipe(Effect.catch(e => Effect.succeed(e+" recovered")))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
