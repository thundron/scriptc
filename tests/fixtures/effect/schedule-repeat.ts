import { Effect, Schedule } from "effect";
let count = 0;
Effect.runPromise(Effect.repeat(Effect.sync(() => ++count), Schedule.recurs(2))).then((n: number) => console.log(n, count));
