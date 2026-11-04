import { Effect, Ref } from "effect";
Effect.runPromise(Effect.gen(function* () { const r = yield* Ref.make(20); yield* Ref.update(r, (n: number) => n + 22); return yield* Ref.get(r); })).then((n: number) => console.log(n));
