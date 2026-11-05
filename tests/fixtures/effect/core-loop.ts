import { Effect } from "effect";
const p = Effect.loop(0, { while: (n: number) => n < 3, step: (n: number) => n + 1, body: (n: number) => Effect.if(n === 1, { onTrue: () => Effect.succeed(10), onFalse: () => Effect.succeed(n) }) });
Effect.runPromise(p).then((a: number[]) => console.log(a.join(",")));
