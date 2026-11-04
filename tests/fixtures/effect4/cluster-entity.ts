import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import * as Schema from "effect/Schema"
import * as Entity from "effect/cluster/Entity"
import * as TestRunner from "effect/cluster/TestRunner"
import * as Rpc from "effect/rpc/Rpc"
const C=Entity.make("Counter",[Rpc.make("Inc",{payload:{amount:Schema.Int},success:Schema.Int})]);const handlers=C.toLayer(Effect.gen(function*(){const n=yield* Ref.make(0);return C.of({Inc:({payload})=>Ref.updateAndGet(n,v=>v+payload.amount)})}));Effect.runPromise((Effect.gen(function*(){const client=yield* C.client;const c=client("counter-1");return [yield* c.Inc({amount:1}),yield* c.Inc({amount:2})]}).pipe(Effect.provide(handlers.pipe(Layer.provideMerge(TestRunner.layer))))).pipe(Effect.tap(value=>Effect.sync(()=>console.log(JSON.stringify(value))))))
