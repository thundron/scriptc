import { createNativeTs7Host } from "../../../packages/compiler/src/frontend/ts7/native-host.js";
import { runProgramHost } from "./ts7-program-host-cases.js";
runProgramHost((options) => createNativeTs7Host(process.argv[2]!, options), process.argv[3]!, process.argv[4]!);
