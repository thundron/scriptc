// @no-node-shims
process.once("uncaughtExceptionMonitor", (error, origin) => {
  console.log("monitor", error.message, origin);
});
const removed = () => console.log("should not run");
process.on("uncaughtException", removed);
process.off("uncaughtException", removed);
process.once("uncaughtException", (error, origin) => {
  console.log("handled", error instanceof Error, error.message, origin);
  process.nextTick(() => console.log("handler tick"));
});
setTimeout(() => console.log("survived"), 10);
throw new Error("entry");
