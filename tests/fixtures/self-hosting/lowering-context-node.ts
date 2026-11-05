import { createNodeFrontendServices } from "../../../packages/compiler/src/frontend/services-node.js";
import { runLoweringContexts } from "./lowering-context-cases.js";

const services = createNodeFrontendServices();
try { runLoweringContexts(services, process.argv[3]!, process.argv[4]!); }
finally { services.close(); }
