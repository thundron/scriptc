import * as Effect from "effect/Effect"
Effect.runPromise((Effect.fail("oops").pipe(Effect.match({onFailure:e=>e,onSuccess:()=>"ok"}))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
