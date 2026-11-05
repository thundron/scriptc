import * as Effect from "effect/Effect"
import * as Random from "effect/Random"
Effect.runPromise((Effect.all([Random.nextIntBetween(1,100),Random.nextIntBetween(1,100)]).pipe(Random.withSeed("fixed"))).pipe(Effect.tap(value=>Effect.sync(()=>console.log(JSON.stringify(value))))))
