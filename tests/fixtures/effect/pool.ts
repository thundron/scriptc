import { Effect, Pool } from "effect";
const p = Effect.scoped(Effect.gen(function* () { const pool = yield* Pool.make({ acquire: Effect.succeed(42), size: 1 }); return yield* Pool.get(pool); }));
Effect.runPromise(p).then((n: number) => console.log(n));
