import { spawn } from "node:child_process";

const child: any = await Promise.resolve(spawn("/bin/cat", [], { stdio: "pipe" }));
const input = child.stdin;
const output = child.stdout;
console.log(input.writable, input.writableEnded, input.writableFinished);
let length = 0;
output.on("data", (chunk: Buffer) => { length += chunk.length; });
const ended = new Promise<void>((resolve) => { output.on("end", resolve); });
const closed = new Promise<void>((resolve) => { child.on("close", resolve); });
const finished = new Promise<void>((resolve) => { input.on("finish", resolve); });
input.end("x".repeat(512 * 1024));
await finished;
await ended;
await closed;
console.log(length, input.writable, input.writableEnded, input.writableFinished, output.readableEnded);

const broken: any = await Promise.resolve(spawn("/bin/sh", ["-c", "exec 0<&-; printf ready; sleep 1"], { stdio: "pipe" }));
const brokenClosed = new Promise<void>((resolve) => { broken.on("close", resolve); });
const error = new Promise<void>((resolve) => {
  broken.stdin.on("error", (failure: NodeJS.ErrnoException) => { console.log(failure.code); resolve(); });
});
broken.stdout.on("data", () => { broken.stdin.write("hello"); });
await error;
await brokenClosed;
