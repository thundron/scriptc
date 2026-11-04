import * as Effect from "effect/Effect"
Effect.runPromise((Effect.fail({_tag:"ApiError" as const,reason:{_tag:"RateLimit" as const,seconds:3}}).pipe(Effect.catchReason("ApiError","RateLimit",r=>Effect.succeed(r.seconds)))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
