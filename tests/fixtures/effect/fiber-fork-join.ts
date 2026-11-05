import { Effect, Fiber } from "effect";
const p = Effect.gen(function* () { const fiber = yield* Effect.fork(Effect.succeed(42)); return yield* Fiber.join(fiber); });
Effect.runPromise(p).then((n: number) => console.log(n));
