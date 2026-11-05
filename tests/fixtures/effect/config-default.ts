import { Effect, Config, ConfigProvider } from "effect";
const p = Config.all({ port: Config.withDefault(Config.integer("PORT"), 3000), host: Config.string("HOST") });
Effect.runPromise(Effect.withConfigProvider(p, ConfigProvider.fromMap(new Map([["HOST", "localhost"]])))).then((v) => console.log(v.host, v.port));
