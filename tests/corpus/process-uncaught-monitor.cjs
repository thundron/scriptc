// @exit: 1
// @no-node-shims
process.on("uncaughtExceptionMonitor", (error, origin) => console.log("monitor", error.message, origin));
throw new Error("unhandled");
