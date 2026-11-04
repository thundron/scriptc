import { Effect } from "effect";
let count = 0;
const p = Effect.suspend(() => ++count < 3 ? Effect.fail("again") : Effect.succeed(count));
Effect.runPromise(Effect.retry(p, { times: 2 })).then((n: number) => console.log(n));
