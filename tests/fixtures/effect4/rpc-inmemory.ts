import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Rpc from "effect/rpc/Rpc"
import * as RpcGroup from "effect/rpc/RpcGroup"
import * as RpcTest from "effect/rpc/RpcTest"
const Group=RpcGroup.make(Rpc.make("double",{payload:{n:Schema.Number},success:Schema.Number})); const handlers=Group.toLayer({double:({n})=>Effect.succeed(n*2)}); Effect.runPromise((Effect.gen(function*(){const c=yield* RpcTest.makeClient(Group);return yield* c.double({n:21})}).pipe(Effect.scoped,Effect.provide(handlers))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
