import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
const Count=Context.Service<number>("Count"); const context=Context.make(Count,42); Effect.runPromiseWith(context)(Count).then((n:number) => console.log(n))
