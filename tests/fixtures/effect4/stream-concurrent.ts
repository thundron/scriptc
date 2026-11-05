import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
Effect.runPromise((Stream.make(1,2,3).pipe(Stream.mapEffect(n=>Effect.succeed(n*2).pipe(Effect.delay("1 millis")),{concurrency:2}),Stream.runCollect)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
