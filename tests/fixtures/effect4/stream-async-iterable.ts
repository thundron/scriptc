import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
async function* values(){yield 1;yield 2} Effect.runPromise((Stream.fromAsyncIterable(values(),String).pipe(Stream.runCollect)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
