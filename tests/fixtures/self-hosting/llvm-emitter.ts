import { readFileSync, writeFileSync } from "node:fs";
import { deserializeModule } from "../../../packages/compiler/src/ir/serialize.js";
import { emitLlvmModule } from "../../../packages/compiler/src/backend/llvm/emitter.js";
import { LlvmUnsupportedError } from "../../../packages/compiler/src/backend/llvm/unsupported.js";

interface Request {
  targetTriple?: string;
  debug: boolean;
  sources: { file: string; text: string }[];
  pointerBits: 32 | 64;
  wasi: boolean;
  emitLibraryIdentity: boolean;
  runtimeAbiMarker: boolean;
}

const module = deserializeModule(readFileSync(process.argv[2]!, "utf8"));
const request = JSON.parse(readFileSync(process.argv[4]!, "utf8")) as Request;
const sources = new Map<string, string>();
for (const source of request.sources) sources.set(source.file, source.text);
try {
  const text = emitLlvmModule(module, {
    ...(request.targetTriple === undefined ? {} : { targetTriple: request.targetTriple }),
    ...(request.debug ? { debugSources: sources } : {}),
    pointerBits: request.pointerBits,
    wasi: request.wasi,
    emitLibraryIdentity: request.emitLibraryIdentity,
    runtimeAbiMarker: request.runtimeAbiMarker,
  });
  writeFileSync(process.argv[3]!, text);
} catch (error) {
  if (error instanceof LlvmUnsupportedError) {
    console.log("unsupported: " + error.message);
    process.exitCode = 2;
  } else if (error instanceof Error) {
    console.log(error.name + ": " + error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
