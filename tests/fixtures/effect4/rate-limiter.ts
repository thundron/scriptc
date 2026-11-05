import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as RateLimiter from "effect/persistence/RateLimiter"
Effect.runPromise((Effect.gen(function*(){const l=yield* RateLimiter.make;const opts={key:"one",limit:1,window:"1 minute" as const,onExceeded:"fail" as const};const a=yield* l.consume(opts);const b=yield* l.consume(opts).pipe(Effect.catch(e=>Effect.succeed(e.reason._tag)));return [a.remaining,b]}).pipe(Effect.provide(RateLimiter.layerStoreMemory))).pipe(Effect.tap(v=>Effect.sync(()=>console.log(JSON.stringify(v))))))
