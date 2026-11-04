import * as Effect from "effect/Effect"
import * as ErrorReporter from "effect/ErrorReporter"
import * as Cause from "effect/Cause"
const r=ErrorReporter.make(o=>console.log(o.error.message));Effect.runPromise(ErrorReporter.report(Cause.fail(new Error("broken"))).pipe(Effect.provide(ErrorReporter.layer([r]))))
