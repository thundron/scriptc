import * as Effect from "effect/Effect"
import * as ExecutionPlan from "effect/ExecutionPlan"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
const S=Context.Service<string>("S");const plan=ExecutionPlan.make({provide:Layer.succeed(S,"one"),attempts:1},{provide:Layer.succeed(S,"two"),attempts:1});Effect.runPromise((S.pipe(Effect.flatMap(s=>s==="one"?Effect.fail("retry"):Effect.succeed(s)),Effect.withExecutionPlan(plan))).pipe(Effect.tap(value=>Effect.sync(()=>console.log(JSON.stringify(value))))))
