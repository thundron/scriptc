import { createNodeFrontendServices } from "../../../packages/compiler/src/frontend/services-node.js";
import { runFrontendServices } from "./frontend-services-cases.js";

const services = createNodeFrontendServices();
try { runFrontendServices(services, process.argv[3]!, process.argv[4]!); }
finally { services.close(); }
