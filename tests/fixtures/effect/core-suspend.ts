import { Effect } from "effect";
let count = 0;
const p = Effect.suspend(() => { count++; return Effect.succeed(count); });
Effect.runPromise(Effect.gen(function* () { console.log(yield* p, yield* p); }));
