import { spawn } from "node:child_process";

const child = spawn("node", ["-e", "let n=0;setTimeout(()=>{process.stdin.on('data',b=>n+=b.length);process.stdin.on('end',()=>console.log(n));process.stdin.resume()},50)"], {
  stdio: ["pipe", "pipe", "pipe"],
});
const input = child.stdin;
const output = child.stdout;
if (input === null || output === null) throw new Error("missing pipe");

let count = "";
let outputEnded = false;
let exited = false;
let exitCode: number | null = null;
output.on("data", (chunk) => { count += chunk.toString(); });
output.on("end", () => { outputEnded = true; console.log("count", count.trim()); });
input.on("drain", () => {
  console.log("drain", input.writable);
  input.end();
});
input.on("finish", () => { console.log("finish", input.writable); });
input.on("error", (err) => { console.log("error", err.message); });
console.log("boundary", input.write(Buffer.alloc(64 * 1024 + 1, 66)));
console.log("write", input.write(Buffer.alloc(1024 * 1024, 65)));
child.on("exit", (code) => { exited = true; exitCode = code; });
// Exit and stdout EOF can arrive in either order. Close follows both.
child.on("close", () => {
  if (!exited || !outputEnded) throw new Error("close before exit or stdout end");
  console.log("exit", exitCode);
});
