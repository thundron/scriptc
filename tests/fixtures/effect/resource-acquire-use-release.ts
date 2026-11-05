import { Effect } from "effect";
const p = Effect.acquireUseRelease(Effect.sync(() => { console.log("acquire"); return 21; }), (n: number) => Effect.succeed(n * 2), () => Effect.sync(() => console.log("release")));
Effect.runPromise(p).then((n: number) => console.log(n));
