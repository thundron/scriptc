import { spawn } from "node:child_process";
import { PassThrough } from "node:stream";

// Effect-style generic storage carries the child through an untyped slot.
const child: any = await Promise.resolve(spawn("/bin/cat", [], { stdio: "pipe" }));
const output = new PassThrough();
let text = "";
output.on("data", (chunk) => { text += chunk.toString(); });
const finished = new Promise<void>((resolve) => { output.on("end", resolve); });
let spawned = false;
let exitCode: number | null = null;
let exitSignal: string | null = null;
child.on("spawn", () => { spawned = typeof child.pid === "number"; });
const removed = () => { console.log("removed"); };
child.on("exit", removed);
child.removeListener("exit", removed);
child.on("exit", (code: number | null, signal: string | null) => { exitCode = code; exitSignal = signal; });
const closed = new Promise<void>((resolve) => { child.on("close", resolve); });
console.log(child.stdout === child.stdout, child.stdin === child.stdin);
child.stdout.pipe(output);
child.stdin.end("hello");
await finished;
await closed;
console.log(spawned, exitCode, exitSignal, JSON.stringify(text));
