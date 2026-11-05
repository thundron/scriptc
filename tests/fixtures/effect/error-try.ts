import { Effect } from "effect";
const p = Effect.try({ try: () => { throw new Error("bad"); }, catch: (e) => String(e) });
Effect.runPromise(Effect.catchAll(p, (s: string) => Effect.succeed("caught:" + s))).then((s: string) => console.log(s));
