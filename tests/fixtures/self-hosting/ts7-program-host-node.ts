import { Ts7Host } from "../../../packages/compiler/src/frontend/ts7/program-adapter.js";
import { runProgramHost } from "./ts7-program-host-cases.js";
runProgramHost((options) => new Ts7Host(options), process.argv[3]!, process.argv[4]!);
