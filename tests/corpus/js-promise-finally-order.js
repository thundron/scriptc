function id(value) { return value; }
async function success() { return 7; }
async function failure() { throw new Error("initial"); }

const events = [];
id(success()).finally(() => { events.push("finally"); }).then(value => events.push("value " + value));
success().finally(() => { events.push("typed finally"); }).then(value => events.push("typed value " + value));
id(success()).finally(() => id(success())).then(value => events.push("adopted " + value));
id(failure()).finally(() => id(success())).catch(error => events.push(String(error)));
id(success()).finally(() => id(failure())).catch(error => events.push("replacement " + String(error)));
queueMicrotask(() => events.push("microtask"));
setTimeout(() => console.log(events.join("|")), 0);
