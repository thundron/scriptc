import { Effect } from "effect";
const p = Effect.onError(Effect.fail("bad"), () => Effect.sync(() => console.log("cleanup")));
Effect.runPromise(Effect.catchAll(p, (s: string) => Effect.succeed(s))).then((s: string) => console.log(s));
