import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
const C=Context.Service<number>("C"); let builds=0; const layer=Layer.effect(C,Effect.sync(()=>++builds)); Effect.runPromise((Effect.gen(function* () { const a=yield* C.pipe(Effect.provide(layer)); const b=yield* C.pipe(Effect.provide(layer)); return [a,b,builds]; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
