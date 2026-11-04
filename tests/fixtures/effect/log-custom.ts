import { Effect, Logger, HashMap, Option } from "effect";
const logger = Logger.make(({ logLevel, message, annotations }) => console.log(logLevel.label, String(message), Option.getOrElse(HashMap.get(annotations, "request"), () => "")));
const p = Effect.annotateLogs(Effect.log("hello"), "request", "abc");
Effect.runPromise(Effect.provide(p, Logger.replace(Logger.defaultLogger, logger))).then(() => console.log("done"));
