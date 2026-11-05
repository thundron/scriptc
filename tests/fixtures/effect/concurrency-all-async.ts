import { Effect } from "effect";
const task = (n: number) => Effect.gen(function* () { yield* Effect.sleep("1 millis"); return n; });
Effect.runPromise(Effect.all([task(1), task(2)], { concurrency: 2 })).then((a: number[]) => console.log(a.join(",")));
