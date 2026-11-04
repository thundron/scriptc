import { readFileSync } from "node:fs";
import { cjsResolvePaths, resolveCjsRuntime } from "../../../packages/compiler/src/frontend/cjs-resolve.js";

interface Request {
  from: string;
  request: string;
  paths: string[] | null;
  lookup: boolean;
}
const requests = JSON.parse(readFileSync(process.argv[2]!, "utf8")) as Request[];
for (const request of requests) {
  if (request.lookup) console.log(JSON.stringify(cjsResolvePaths(request.from, request.request)));
  else console.log(JSON.stringify(resolveCjsRuntime(request.from, request.request, request.paths === null ? undefined : request.paths)));
}
