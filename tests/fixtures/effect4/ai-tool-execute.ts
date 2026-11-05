import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as Schema from "effect/Schema"
import * as Tool from "effect/ai/Tool"
import * as Toolkit from "effect/ai/Toolkit"
const kit=Toolkit.make(Tool.make("double",{description:"double",parameters:Schema.Struct({n:Schema.Number}),success:Schema.Number}));const layer=kit.toLayer({double:({n})=>Effect.succeed(n*2)});Effect.runPromise((Effect.gen(function*(){const handlers=yield* kit;const stream=yield* handlers.handle("double",{n:21},"call-1");return yield* Stream.runCollect(stream)}).pipe(Effect.provide(layer))).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
