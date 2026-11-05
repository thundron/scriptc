import { Effect } from "effect";
Effect.runPromise(Effect.forEach([1, 2, 3], (n: number) => Effect.succeed(n * 2))).then((a: number[]) => console.log(a.join(",")));
