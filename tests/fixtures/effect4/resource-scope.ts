import * as Effect from "effect/Effect"
import * as Scope from "effect/Scope"
import * as Exit from "effect/Exit"
Effect.runPromise((Effect.gen(function* () { const scope=yield* Scope.make(); let n=0; yield* Scope.addFinalizer(scope,Effect.sync(()=>{n=42})); yield* Scope.close(scope,Exit.void); return n; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
