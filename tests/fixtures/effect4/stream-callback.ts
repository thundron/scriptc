import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as Queue from "effect/Queue"
Effect.runPromise((Stream.callback<number>(q=>Effect.gen(function*(){yield* Queue.offer(q,42);yield* Queue.end(q)})).pipe(Stream.runCollect)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
