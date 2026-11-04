import { Context, Effect } from "effect";
const Count = Context.GenericTag<number>("Count");
const p = Effect.map(Effect.context<number>(), (c) => Context.get(c, Count));
Effect.runPromise(Effect.provide(p, Context.make(Count, 42))).then((n: number) => console.log(n));
