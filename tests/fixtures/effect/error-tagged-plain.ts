import { Effect } from "effect";
const p = Effect.catchTag(Effect.fail({ _tag: "Missing" as const, id: 7 }), "Missing", (e) => Effect.succeed(e.id + 1));
Effect.runPromise(p).then((n: number) => console.log(n));
