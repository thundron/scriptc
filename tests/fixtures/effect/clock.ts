import { Effect, Clock } from "effect";
Effect.runPromise(Clock.currentTimeMillis).then((n: number) => console.log(n > 0));
