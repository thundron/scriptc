import * as Effect from "effect/Effect"
Effect.runPromise((Effect.all([Effect.succeed(1),Effect.succeed("two")])).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
