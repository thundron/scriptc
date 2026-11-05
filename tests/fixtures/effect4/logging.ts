import * as Effect from "effect/Effect"
import * as Logger from "effect/Logger"
Effect.runPromise((Effect.log("Hello world").pipe(Effect.annotateLogs({requestId:"r1"}),Effect.provide(Logger.layer([Logger.make(options=>console.log(JSON.stringify({message:options.message,annotations:options.logLevel})))])))).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
