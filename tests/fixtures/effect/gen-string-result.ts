import { Effect } from "effect";
const p = Effect.gen(function* () { const name = yield* Effect.succeed("world"); return name; });
Effect.runPromise(p).then((s: string) => console.log(s));
