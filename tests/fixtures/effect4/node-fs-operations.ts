import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const directory = yield* fs.makeTempDirectoryScoped();
  const original = directory + "/original.txt";
  yield* fs.writeFileString(original, "hello");
  yield* fs.access(original, { readable: true });
  yield* fs.copyFile(original, directory + "/copy.txt");
  yield* fs.rename(directory + "/copy.txt", directory + "/renamed.txt");
  const info = yield* fs.stat(original);
  const contents = yield* fs.readFileString(directory + "/renamed.txt");
  const missing = yield* fs.exists(directory + "/missing.txt");
  console.log(info.type, Number(info.size), contents, missing);
}).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer));

Effect.runPromise(program);
