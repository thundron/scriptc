import { createNativeTs7Api } from "../../../packages/compiler/src/frontend/ts7/native-api.js";
import { Ts7SourceParser } from "../../../packages/compiler/src/frontend/ts7/source-parser.js";
import { runCjsClient } from "./cjs-client-cases.js";

const parser = new Ts7SourceParser((options) => createNativeTs7Api({ ...options, executable: process.argv[2]! }));
try { runCjsClient(parser, process.argv[3]!, process.argv[4]!); }
finally { parser.close(); }
