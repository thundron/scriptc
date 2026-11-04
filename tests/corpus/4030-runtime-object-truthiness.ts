import { createServer, Server } from "node:net";

function serverPresent(server: Server | null): boolean {
  return !!server;
}

const server = createServer(() => {});
console.log("streams", !!process.stdin, !!process.stdout, !!process.stderr);
console.log("input", process.stdin ? "present" : "absent");
console.log("server", serverPresent(server), serverPresent(null), !!server);
