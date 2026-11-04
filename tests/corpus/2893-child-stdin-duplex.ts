import { spawn } from "node:child_process";

const child = spawn("node", ["-e", "process.stdin.on('data', b => process.stdout.write(b));"]);
const input = child.stdin;
const output = child.stdout;
const errors = child.stderr;
if (input === null || output === null || errors === null) throw new Error("missing pipe");

let echoed = "";
let outputEnded = false;
let exited = false;
let exitCode: number | null = null;
output.on("data", (chunk) => { echoed += chunk.toString(); });
output.on("end", () => { outputEnded = true; });
errors.on("data", (chunk) => { process.stderr.write(chunk); });
input.on("finish", () => { console.log("finish", input.writable); });
input.on("error", (err) => { console.log("error", err.message); });
console.log("initial", input.writable);
console.log("writes", input.write("hé"), input.write(new Uint8Array([108, 108, 111, 10])));
input.end();
console.log("ended", input.writable);
child.on("exit", (code) => { exited = true; exitCode = code; });
// Exit and stdout EOF can arrive in either order. Close follows both.
child.on("close", () => {
  if (!exited || !outputEnded) throw new Error("close before exit or stdout end");
  console.log("exit", exitCode);
  console.log("echo", JSON.stringify(echoed));
});
