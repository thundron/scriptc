import { run } from "./core/index.ts";
import * as state from "./state.ts";

function read(bytes: Uint8Array): number | null {
  bytes[0] = 7;
  return bytes.length;
}

run(read, (value) => console.log("value", value));
console.log("calls", state.calls);
