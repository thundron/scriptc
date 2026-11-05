// @dynamic
// @stderr
// The fixture module executes Node core APIs inside the embedded engine.
import { report } from "fszoo/descriptors.js";
async function main(): Promise<void> { const out: string = await report(); console.log(out); }
main();
