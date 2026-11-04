import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"
import * as ManagedRuntime from "effect/ManagedRuntime"
const C=Context.Service<number>("C"); const r=ManagedRuntime.make(Layer.succeed(C,42)); r.runPromise(C).then((n:number)=>{console.log(n); return r.dispose()}).then(()=>console.log("disposed"))
