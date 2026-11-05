import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
Effect.runPromise((Effect.fail("oops").pipe(Effect.result, Effect.map(r => Result.match(r,{onFailure:e=>"failure:"+e,onSuccess:()=>"success"})))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
