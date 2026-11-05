import { Context, Effect } from "effect";
class Config extends Context.Tag("Config")<Config, { readonly greeting: string }>() {}
const p = Effect.gen(function* () { const c = yield* Config; return c.greeting; });
Effect.runPromise(Effect.provideService(p, Config, { greeting: "hello" })).then((s: string) => console.log(s));
