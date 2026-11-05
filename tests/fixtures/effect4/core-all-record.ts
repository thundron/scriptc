import * as Effect from "effect/Effect"
Effect.runPromise((Effect.all({one:Effect.succeed(1),two:Effect.succeed("two")})).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
