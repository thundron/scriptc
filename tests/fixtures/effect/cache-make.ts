import { Effect, Cache } from "effect";
let calls = 0;
const p = Effect.gen(function* () { const c = yield* Cache.make({ capacity: 10, timeToLive: "1 minute", lookup: (n: number) => Effect.sync(() => { calls++; return n * 2; }) }); console.log(yield* c.get(21), yield* c.get(21), calls); });
Effect.runPromise(p);
