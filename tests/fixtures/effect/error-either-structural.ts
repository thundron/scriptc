import { Effect } from "effect";
Effect.runPromise(Effect.either(Effect.fail("bad"))).then((e: { readonly _tag: string }) => console.log(e._tag));
