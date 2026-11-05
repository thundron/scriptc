import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
const program=Effect.gen(function*(){const fs=yield* FileSystem.FileSystem;const dir=yield* fs.makeTempDirectoryScoped();const path=dir+"/hello.txt";yield* fs.writeFileString(path,"hello");return yield* fs.readFileString(path)}).pipe(Effect.scoped,Effect.provide(NodeFileSystem.layer),Effect.tap(v=>Effect.sync(()=>console.log(v))));
Effect.runPromise(program);
