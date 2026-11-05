import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
Effect.runPromise((Stream.merge(Stream.make(1,3),Stream.make(2,4)).pipe(Stream.runCollect,Effect.map(ns=>[...ns].sort()))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
