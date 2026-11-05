import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
const Flag=Context.Reference<boolean>("Flag",{defaultValue:()=>false}); Effect.runPromise((Effect.gen(function* () { const a=yield* Flag; const b=yield* Flag.pipe(Effect.provideService(Flag,true)); const c=yield* Flag; return [a,b,c]; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
