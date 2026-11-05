import { Effect } from "effect";
const p = Effect.tryPromise({ try: () => Promise.reject("bad"), catch: (e) => "caught:" + String(e) });
Effect.runPromise(Effect.catchAll(p, (s: string) => Effect.succeed(s))).then((s: string) => console.log(s));
