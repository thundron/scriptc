import { FrontendServices } from "../../../packages/compiler/src/frontend/services.js";
import { createNativeTs7Api } from "../../../packages/compiler/src/frontend/ts7/native-api.js";
import { runTypeMapper } from "./type-mapper-cases.js";

const services = new FrontendServices((options) => createNativeTs7Api({ ...options, executable: process.argv[2]! }));
try { runTypeMapper(services, process.argv[3]!, process.argv[4]!); }
finally { services.close(); }
