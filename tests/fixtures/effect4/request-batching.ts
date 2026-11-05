import * as Effect from "effect/Effect"
import * as Request from "effect/Request"
import * as RequestResolver from "effect/RequestResolver"
import * as Exit from "effect/Exit"
class Get extends Request.Class<{readonly id:number},number> {} const resolver=RequestResolver.make<Get>(entries=>Effect.sync(()=>{for(const entry of entries)entry.completeUnsafe(Exit.succeed(entry.request.id*2))})); Effect.runPromise((Effect.forEach([1,2,3],id=>Effect.request(new Get({id}),resolver),{concurrency:"unbounded"})).pipe(Effect.tap(value => Effect.sync(() => console.log(JSON.stringify(value))))))
