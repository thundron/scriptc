import * as Effect from "effect/Effect"
Effect.runPromise((Effect.all([1,2,3].map(n=>Effect.succeed(n).pipe(Effect.delay("1 millis"))),{concurrency:2})).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
