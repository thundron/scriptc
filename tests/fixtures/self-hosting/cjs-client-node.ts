import { Ts7Api } from "../../../packages/compiler/src/frontend/ts7/rpc-api.js";
import { Ts7SourceParser } from "../../../packages/compiler/src/frontend/ts7/source-parser.js";
import { runCjsClient } from "./cjs-client-cases.js";

const parser = new Ts7SourceParser((options) => new Ts7Api(options));
try { runCjsClient(parser, process.argv[3]!, process.argv[4]!); }
finally { parser.close(); }
