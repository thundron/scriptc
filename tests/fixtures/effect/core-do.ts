import { Effect, pipe } from "effect";
const p = pipe(Effect.Do, Effect.bind("a", () => Effect.succeed(20)), Effect.bind("b", ({ a }) => Effect.succeed(a + 1)), Effect.let("total", ({ a, b }) => a + b));
Effect.runPromise(p).then((v) => console.log(v.total));
