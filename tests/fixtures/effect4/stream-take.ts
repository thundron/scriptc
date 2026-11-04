import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
Effect.runPromise((Stream.iterate(1,n=>n+1).pipe(Stream.take(3),Stream.runCollect)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
