import * as Effect from "effect/Effect"
import * as PubSub from "effect/PubSub"
import * as Queue from "effect/Queue"
Effect.runPromise((Effect.gen(function*(){const p=yield* PubSub.unbounded<number>();const q=yield* PubSub.subscribe(p);yield* PubSub.publish(p,42);return yield* PubSub.take(q)}).pipe(Effect.scoped)).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
