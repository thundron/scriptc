import * as Effect from "effect/Effect"
Effect.runPromise((Effect.fail({_tag:"Missing" as const,id:1}).pipe(Effect.catchTags({Missing:e=>Effect.succeed(e.id)}))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
