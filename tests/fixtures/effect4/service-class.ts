import { Context, Effect } from "effect"
class Name extends Context.Service<Name, { value: string }>()("Name") {}
const p = Effect.gen(function* () { return (yield* Name).value })
Effect.runPromise(p.pipe(Effect.provideService(Name, {value:"world"}))).then((x: string) => console.log(x))
