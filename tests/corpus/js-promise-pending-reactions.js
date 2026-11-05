function gather(values) { return Promise.all(values); }
const events = [];
console.log(await 1, await undefined);
function identity(value) { return value; }
console.log(await identity(3));
const pending = new Promise(resolve => queueMicrotask(() => resolve(2)));
pending.then(value => events.push("then:" + value));
const read = async () => { events.push("await:" + await pending); };
const reading = read();
queueMicrotask(() => events.push("tick"));
console.log((await gather([pending, Promise.resolve(3), 4])).join(","));
await reading;
console.log(events.join(";"));
const nested = Promise.resolve(5).then(value => new Promise(resolve => queueMicrotask(() => resolve(value + 1))));
console.log(await nested);
const failed = new Promise((resolve, reject) => queueMicrotask(() => reject(new Error("pending"))));
console.log(await failed.catch(error => Promise.resolve(error.message)));
try { await gather([Promise.resolve(1), Promise.reject(new Error("all"))]); }
catch (error) { console.log(error.message); }
let cycle;
cycle = Promise.resolve().then(() => cycle);
try { await cycle; } catch (error) { console.log(error.name); }
function cleanup(promise, callback) { return promise.finally(callback); }
console.log(await cleanup(Promise.resolve(7), () => new Promise(resolve => queueMicrotask(() => { events.push("cleanup"); resolve(9); }))));
console.log(events[events.length - 1]);
try { await cleanup(Promise.resolve(8), () => Promise.reject(new Error("cleanup failed"))); }
catch (error) { console.log(error.message); }
