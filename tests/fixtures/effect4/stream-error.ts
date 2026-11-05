import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
Effect.runPromise((Stream.fail("oops").pipe(Stream.catch(e=>Stream.succeed(e)),Stream.runCollect)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
