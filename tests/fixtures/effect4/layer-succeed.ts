import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
const C=Context.Service<number>("C"); Effect.runPromise((C.pipe(Effect.provide(Layer.succeed(C,42)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
