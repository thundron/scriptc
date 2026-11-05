import { scryptSync } from "node:crypto";
import type { ScryptOptions } from "node:crypto";

let reads = "";
const options: ScryptOptions = {
  get N() { reads += "N,"; return 16; },
  get cost() { reads += "cost,"; return undefined; },
  get r() { reads += "r,"; return 1; },
  get blockSize() { reads += "blockSize,"; return undefined; },
  get p() { reads += "p,"; return 1; },
  get parallelization() { reads += "parallelization,"; return undefined; },
  get maxmem() { reads += "maxmem,"; return 2432; },
};
console.log("getters", scryptSync("p", "s", 8, options).toString("hex"), reads);
const optional: ScryptOptions = { N: undefined, r: 1, p: 1, cost: 16, maxmem: 2432 };
console.log("optional", scryptSync("p", "s", 8, optional).toString("hex"));
let trace = "";
function password(): string { trace += "password,"; return "p"; }
function salt(): string { trace += "salt,"; return "s"; }
function length(): number { trace += "length,"; return 8; }
function config(): ScryptOptions { trace += "options,"; return { N: 16, r: 1, p: 1 }; }
console.log("arguments", scryptSync(password(), salt(), length(), config()).toString("hex"), trace);
