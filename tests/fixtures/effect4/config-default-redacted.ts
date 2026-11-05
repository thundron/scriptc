import * as Effect from "effect/Effect"
import * as Config from "effect/Config"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Redacted from "effect/Redacted"
Effect.runPromise((Effect.gen(function*(){const n=yield* Config.String("MISSING").pipe(Config.withDefault("default")); const secret=yield* Config.Redacted("TOKEN");return [n,Redacted.value(secret)]}).pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({TOKEN:"secret"}))))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
