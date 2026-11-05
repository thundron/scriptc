import * as Effect from "effect/Effect"
import * as LayerMap from "effect/LayerMap"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"
const C=Context.Service<number>("C");Effect.runPromise((Effect.gen(function*(){const m=yield* LayerMap.fromRecord({one:Layer.succeed(C,1),two:Layer.succeed(C,2)});const a=yield* C.pipe(Effect.provide(m.get("one")));const b=yield* C.pipe(Effect.provide(m.get("two")));return [a,b]}).pipe(Effect.scoped)).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
