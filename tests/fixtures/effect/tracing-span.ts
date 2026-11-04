import { Effect } from "effect";
const p = Effect.withSpan(Effect.map(Effect.currentSpan, (s) => s.name), "operation");
Effect.runPromise(p).then((s: string) => console.log(s));
