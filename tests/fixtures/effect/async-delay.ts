import { Effect } from "effect";
Effect.runPromise(Effect.delay(Effect.succeed(42), "1 millis")).then((n: number) => console.log(n));
