import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
const Count=Context.Service<number>("Count"); Effect.runPromise((Count.pipe(Effect.provideService(Count,42))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
