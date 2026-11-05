import { Effect } from "effect";
const p = Effect.catchTag(Effect.timeout(Effect.never, "1 millis"), "TimeoutException", () => Effect.succeed("timed out"));
Effect.runPromise(p).then((s: string) => console.log(s));
