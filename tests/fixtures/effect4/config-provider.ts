import * as Effect from "effect/Effect"
import * as Config from "effect/Config"
import * as ConfigProvider from "effect/ConfigProvider"
Effect.runPromise((Effect.gen(function* () { const p=ConfigProvider.fromUnknown({NAME:"world",PORT:"42"});const a=yield* Config.String("NAME").pipe(Effect.provide(ConfigProvider.layer(p)));const b=yield* Config.Int("PORT").pipe(Effect.provide(ConfigProvider.layer(p)));return [a,b]; })).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
