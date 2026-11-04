import * as Effect from "effect/Effect"
import * as Config from "effect/Config"
import * as ConfigProvider from "effect/ConfigProvider"
Effect.runPromise((Config.String("NAME").pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromDotEnvContents("NAME=world\n"))))).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
