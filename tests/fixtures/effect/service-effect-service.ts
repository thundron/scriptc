import { Effect } from "effect";
class Counter extends Effect.Service<Counter>()("Counter", { sync: () => ({ value: 42 }) }) {}
const p = Effect.gen(function* () { const c = yield* Counter; return c.value; });
Effect.runPromise(Effect.provide(p, Counter.Default)).then((n: number) => console.log(n));
