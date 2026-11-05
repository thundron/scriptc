import { Context, Layer, ManagedRuntime } from "effect";
const Count = Context.GenericTag<number>("Count");
const runtime = ManagedRuntime.make(Layer.succeed(Count, 42));
runtime.runPromise(Count).then((n: number) => { console.log(n); return runtime.dispose(); }).then(() => console.log("disposed"));
