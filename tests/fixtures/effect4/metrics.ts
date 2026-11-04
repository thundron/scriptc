import * as Effect from "effect/Effect"
import * as Metric from "effect/Metric"
Effect.runPromise((Effect.gen(function* () { const c=Metric.counter("requests");yield* Metric.update(c,2);yield* Metric.update(c,3);return yield* Metric.value(c); })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
