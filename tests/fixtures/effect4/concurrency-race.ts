import * as Effect from "effect/Effect"
Effect.runPromise((Effect.race(Effect.succeed("first"),Effect.never)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
