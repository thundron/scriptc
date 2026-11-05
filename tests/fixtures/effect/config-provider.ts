import { Effect, Config, ConfigProvider } from "effect";
const p = Effect.withConfigProvider(Config.integer("PORT"), ConfigProvider.fromMap(new Map([["PORT", "3000"]])));
Effect.runPromise(p).then((n: number) => console.log(n));
