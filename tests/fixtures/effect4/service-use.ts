import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
const S=Context.Service<{value:number}>("S"); Effect.runPromise((S.useSync(s=>s.value).pipe(Effect.provideService(S,{value:42}))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
