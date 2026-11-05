import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as LayerRef from "effect/LayerRef"
import * as Context from "effect/Context"
const S=Context.Service<number>("S");let builds=0;Effect.runPromise((Effect.gen(function*(){const r=yield* LayerRef.make(Layer.effect(S,Effect.sync(()=>++builds)));const a=yield* S.pipe(Effect.provide(r.get));yield* r.refresh;const b=yield* S.pipe(Effect.provide(r.get));return [a,b,builds]}).pipe(Effect.scoped)).pipe(Effect.tap(value=>Effect.sync(()=>console.log(JSON.stringify(value))))))
