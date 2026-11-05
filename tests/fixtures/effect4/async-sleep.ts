import * as Effect from "effect/Effect"
Effect.runPromise((Effect.gen(function* () { yield* Effect.sleep("1 millis"); yield* Effect.yieldNow; return yield* Effect.succeed(42).pipe(Effect.delay("1 millis")); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
