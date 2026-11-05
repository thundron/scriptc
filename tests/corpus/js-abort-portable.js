const controller = new AbortController();
const signal = controller.signal;
console.log("identity", signal === controller.signal, signal.aborted, signal.reason);
let count = 0;
function removed() { console.log("removed"); }
signal.addEventListener("abort", removed);
signal.removeEventListener("abort", removed);
signal.addEventListener("abort", function (event) {
  count++;
  console.log("listener", this === signal, event.type, event.target === signal, signal.aborted);
}, { once: true });
signal.onabort = function (event) { console.log("onabort", this === signal, event.type); };
const combined = AbortSignal.any([signal, new AbortController().signal]);
const reason = { message: "cancelled" };
controller.abort(reason);
controller.abort("ignored");
console.log("reason", signal.reason === reason, combined.aborted, combined.reason === reason, count);
try { signal.throwIfAborted(); } catch (error) { console.log("throw", error === reason); }
const already = AbortSignal.abort("ready");
console.log("already", already.aborted, already.reason, AbortSignal.any([already]).reason);
const defaultSignal = AbortSignal.abort();
console.log("default", defaultSignal.reason.name, defaultSignal.reason.message);
console.log("timeout", AbortSignal.timeout(1000).aborted);
try { AbortSignal.timeout(-1); } catch (error) { console.log("range", error.name, error.code); }
const timed = AbortSignal.timeout(1);
await new Promise(resolve => setTimeout(resolve, 20));
console.log("timed", timed.aborted, timed.reason.name, timed.reason.message);
