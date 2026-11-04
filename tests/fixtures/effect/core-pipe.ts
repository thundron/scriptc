import { Effect, pipe } from "effect";
const p = pipe(Effect.succeed(20), Effect.map((n: number) => n + 1), Effect.flatMap((n: number) => Effect.succeed(n * 2)), Effect.tap((n: number) => Effect.sync(() => console.log("tap", n))), Effect.as("done"));
Effect.runPromise(p).then((s: string) => console.log(s));
