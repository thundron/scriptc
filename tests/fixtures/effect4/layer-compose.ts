import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
const A=Context.Service<number>("A"); const B=Context.Service<number>("B"); const a=Layer.succeed(A,20); const b=Layer.effect(B,A.useSync(n=>n+2)).pipe(Layer.provide(a)); Effect.runPromise((Effect.all([A,B]).pipe(Effect.provide(Layer.mergeAll(a,b)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
