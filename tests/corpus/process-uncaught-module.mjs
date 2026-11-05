process.once("uncaughtExceptionMonitor", (error, origin) => console.log("monitor", error.message, origin));
process.once("uncaughtException", (error, origin) => {
  console.log("handled module", error.message, origin);
  setTimeout(() => console.log("resumed"), 10);
});
await Promise.resolve();
throw new Error("module");
