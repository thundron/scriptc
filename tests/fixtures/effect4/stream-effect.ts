import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
Effect.runPromise((Stream.fromEffect(Effect.succeed(21)).pipe(Stream.mapEffect(n=>Effect.succeed(n*2)),Stream.runCollect)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
