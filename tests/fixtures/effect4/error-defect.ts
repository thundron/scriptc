import * as Effect from "effect/Effect"
Effect.runPromise((Effect.die("broken").pipe(Effect.catchDefect(() => Effect.succeed("recovered")))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
