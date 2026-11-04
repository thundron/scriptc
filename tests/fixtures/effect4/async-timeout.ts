import * as Effect from "effect/Effect"
Effect.runPromise((Effect.never.pipe(Effect.timeout("1 millis"),Effect.catch(e=>Effect.succeed(e._tag)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
