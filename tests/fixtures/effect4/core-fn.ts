import * as Effect from "effect/Effect"
const double=Effect.fn("double")(function* (n:number) { return yield* Effect.succeed(n*2) });
Effect.runPromise((double(21)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
