import { Effect } from "effect";
Effect.runPromise(Effect.sync(() => 42)).then((n: number) => console.log(n));
