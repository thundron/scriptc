import { Effect, Config, ConfigProvider, Redacted } from "effect";
const p = Effect.withConfigProvider(Config.redacted("SECRET"), ConfigProvider.fromMap(new Map([["SECRET", "fixture-only"]])));
Effect.runPromise(p).then((v) => console.log(String(v), Redacted.value(v)));
