import { Effect, Ref } from "effect";
const p = Effect.gen(function* () { const r = yield* Ref.make(20); yield* Ref.update(r, (n: number) => n + 22); const n: number = yield* Ref.get(r); return n; });
Effect.runPromise(p).then((n: number) => console.log(n));
