import { Effect } from "effect";
Effect.runPromise(Effect.catchAllDefect(Effect.die("boom"), (e) => Effect.succeed(String(e)))).then((s: string) => console.log(s));
