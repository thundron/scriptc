import { Effect, Metric } from "effect";
const counter = Metric.counter("requests");
Effect.runPromise(Effect.gen(function* () { yield* Metric.increment(counter); const v = yield* Metric.value(counter); console.log(v.count); }));
