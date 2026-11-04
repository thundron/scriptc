// Named signals use host numbers, deliver their name, and preserve callback identity.
const signal = String("SIGWINCH");
let deliveries = 0;
const keepAlive = setInterval(() => {}, 1000);
const late = () => console.log("late");
const removed = () => console.log("removed snapshot");
const listener = (name, number) => {
  console.log("signal", name, number > 0, ++deliveries);
  process.off(signal, removed);
  if (deliveries === 1) {
    process.on(signal, late);
    setTimeout(() => process.kill(process.pid, signal), 20);
  } else {
    process.off(signal, listener);
    process.off(signal, late);
    clearInterval(keepAlive);
  }
};
process.on(signal, listener);
process.once(signal, (name) => console.log("once", name));
process.on(signal, removed);
process.on("SIGBREAK", late);
process.removeListener("SIGBREAK", late);
for (const name of ["SIGKILL", "SIGSTOP"]) {
  try {
    process.on(name, late);
  } catch (error) {
    console.log("uncatchable", error.code);
  }
}
setTimeout(() => process.kill(process.pid, signal), 20);
