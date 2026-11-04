import * as Effect from "effect/Effect"
import * as KeyValueStore from "effect/persistence/KeyValueStore"
import * as Option from "effect/Option"
Effect.runPromise((Effect.gen(function*(){const kv=yield* KeyValueStore.KeyValueStore;yield* kv.set("key","world");return (yield* kv.get("key")) ?? "missing"}).pipe(Effect.provide(KeyValueStore.layerMemory))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
