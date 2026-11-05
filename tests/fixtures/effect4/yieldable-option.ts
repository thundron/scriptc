import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
Effect.runPromise((Effect.gen(function* () { const a=yield* Effect.fromOption(Option.some(40)); const b=yield* Effect.fromOption(Option.some(2)); return a+b; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
