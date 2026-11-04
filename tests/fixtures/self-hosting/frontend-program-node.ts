import { createNodeFrontendServices } from "../../../packages/compiler/src/frontend/services-node.js";
import { runFrontendPrograms } from "./frontend-program-cases.js";

const services = createNodeFrontendServices();
try { runFrontendPrograms(services, process.argv[3]!, process.argv[4]!); }
finally { services.close(); }
