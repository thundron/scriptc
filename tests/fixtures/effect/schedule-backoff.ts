import { Effect, Schedule } from "effect";
let count = 0;
const p = Effect.suspend(() => ++count < 2 ? Effect.fail("again") : Effect.succeed(count));
const policy = Schedule.intersect(Schedule.exponential("1 millis"), Schedule.recurs(1));
Effect.runPromise(Effect.retry(p, policy)).then((n: number) => console.log(n));
