import { Effect } from "effect";
const p = Effect.ensuring(Effect.succeed(42), Effect.sync(() => console.log("cleanup")));
Effect.runPromise(p).then((n: number) => console.log(n));
