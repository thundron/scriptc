import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as Sink from "effect/Sink"
Effect.runPromise((Stream.make(1,2,3).pipe(Stream.run(Sink.sum))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
