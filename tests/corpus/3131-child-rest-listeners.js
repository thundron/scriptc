import { spawn } from "node:child_process";

const child = spawn("/bin/sh", ["-c", "exit 0"], { stdio: "ignore" });
child.on("spawn", (...args) => { console.log("spawn", JSON.stringify(args)); });
child.once("exit", (...args) => { console.log("exit", JSON.stringify(args)); });
await new Promise((resolve) => {
  child.on("close", (code, ...args) => { console.log("close", code, JSON.stringify(args)); resolve(undefined); });
});

const failed = spawn("/scriptc-command-that-does-not-exist", [], { stdio: "ignore" });
failed.on("error", (...args) => { console.log("error", args.length, args[0].code); });
