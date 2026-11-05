// @exit: 7
process.once("uncaughtException", (error, origin) => {
  console.log("handler", error.message, origin);
  throw new Error("handler failed");
});
setTimeout(() => { throw new Error("timer"); }, 1);
