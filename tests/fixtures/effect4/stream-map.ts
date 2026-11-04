import { Effect, Stream } from "effect"
Effect.runPromise(Stream.fromIterable([1,2,3]).pipe(Stream.map(n => n*2), Stream.runCollect)).then((x: ReadonlyArray<number>) => console.log(JSON.stringify(x)))
