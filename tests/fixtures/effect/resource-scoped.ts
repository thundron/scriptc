import { Effect } from "effect";
let released = false;
const r = Effect.acquireRelease(Effect.succeed("resource"), () => Effect.sync(() => { released = true; }));
Effect.runPromise(Effect.scoped(r)).then((s: string) => console.log(s, released));
