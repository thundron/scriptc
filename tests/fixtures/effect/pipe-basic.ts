import { Effect, pipe } from "effect";
const p = pipe(Effect.succeed(20), Effect.map((n: number) => n + 1), Effect.flatMap((n: number) => Effect.succeed(n * 2)));
Effect.runPromise(p).then((n: number) => console.log(n));
