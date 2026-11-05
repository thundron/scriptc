import { createNodeFrontendServices } from "../../../packages/compiler/src/frontend/services-node.js";
import { runTypeMapper } from "./type-mapper-cases.js";

const services = createNodeFrontendServices();
try { runTypeMapper(services, process.argv[3]!, process.argv[4]!); }
finally { services.close(); }
