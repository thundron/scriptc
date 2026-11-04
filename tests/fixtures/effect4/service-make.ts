import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
class Counter extends Context.Service<Counter>()("Counter", {make:Effect.succeed({count:42})}) { static layer=Layer.effect(this,this.make) } Effect.runPromise((Counter.useSync(c=>c.count).pipe(Effect.provide(Counter.layer))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
