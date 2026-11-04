import { Effect } from "effect";
Effect.runPromiseExit(Effect.fail("bad")).then((e: { readonly _tag: string }) => console.log(e._tag));
