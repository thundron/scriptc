import * as Effect from "effect/Effect"
import * as Crypto from "effect/Crypto"
const c=Crypto.make({randomBytes:n=>new Uint8Array(n),digest:(_,data)=>Effect.succeed(data)});Effect.runPromise((c.randomBytes(3).pipe(Effect.map(b=>Array.from(b)))).pipe(Effect.tap(value=>Effect.sync(()=>console.log(JSON.stringify(value))))))
