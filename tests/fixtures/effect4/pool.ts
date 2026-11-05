import * as Effect from "effect/Effect"
import * as Pool from "effect/Pool"
Effect.runPromise((Effect.gen(function*(){const pool=yield* Pool.make({acquire:Effect.succeed(42),size:1});return yield* Pool.get(pool)}).pipe(Effect.scoped)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
