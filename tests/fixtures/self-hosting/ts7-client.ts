import { readSync, writeSync } from "node:fs";
import { Ts7RpcClient } from "../../../packages/compiler/src/frontend/ts7/rpc-client.js";
import { Ts7Wire } from "../../../packages/compiler/src/frontend/ts7/rpc-wire.js";
import { runTs7Client } from "./ts7-client-cases.js";

// This entry preserves the inherited-descriptor oracle. The native process
// entry starts its own server and runs these same protocol/checker cases.
const client = new Ts7RpcClient(new Ts7Wire({
  read: (buffer, offset, length) => readSync(3, buffer, offset, length, null),
  write: (buffer, offset, length) => writeSync(4, buffer, offset, length, null),
  close: () => {},
}));
runTs7Client(client, process.argv[2]!, process.argv[3]!);
