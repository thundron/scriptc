import { performance as imported } from "node:perf_hooks";
console.log(typeof performance, typeof performance.now);
console.log(typeof globalThis.performance, typeof globalThis.performance.now);
console.log(typeof imported, typeof imported.now);
if (typeof performance !== "undefined" && typeof performance.now === "function") {
  const first = performance.now();
  const last = performance.now();
  console.log(first >= 0, last >= first);
}
function shadowed() {
  const performance = { now: 5 };
  console.log(typeof performance.now);
}
shadowed();
