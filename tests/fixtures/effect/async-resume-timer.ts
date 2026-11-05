import { Effect } from "effect";
const p = Effect.async<number>((resume) => { const t = setTimeout(() => resume(Effect.succeed(42)), 1); return Effect.sync(() => clearTimeout(t)); });
Effect.runPromise(p).then((n: number) => console.log(n));
