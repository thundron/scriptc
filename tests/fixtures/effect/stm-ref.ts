import { Effect, STM, TRef } from "effect";
const p = STM.gen(function* () { const r = yield* TRef.make(20); yield* TRef.update(r, (n: number) => n + 22); return yield* TRef.get(r); });
Effect.runPromise(STM.commit(p)).then((n: number) => console.log(n));
