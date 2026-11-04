process.once("uncaughtExceptionMonitor", (error, origin) => console.log("monitor", error.message, origin));
process.once("uncaughtException", (error, origin) => {
  console.log("handled rejection", error.message, origin);
  process.once("unhandledRejection", () => { throw new Error("listener"); });
  process.once("uncaughtException", (error, origin) => console.log("handled listener", error.message, origin));
  setTimeout(() => Promise.reject(new Error("next")), 10);
});
Promise.reject(new Error("first"));
