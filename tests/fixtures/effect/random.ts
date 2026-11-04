import { Effect, Random } from "effect";
Effect.runPromise(Random.nextIntBetween(1, 2)).then((n: number) => console.log(n));
