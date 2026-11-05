import { Context, Effect } from "effect";
const Config = Context.GenericTag<{ readonly greeting: string }>("Config");
const p = Effect.gen(function* () { const c = yield* Config; return c.greeting; });
Effect.runPromise(Effect.provideService(p, Config, { greeting: "hello" })).then((s: string) => console.log(s));
