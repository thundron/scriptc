let calls = 0;
function step(): void { calls++; console.log("argument", calls); }
Promise.resolve(step()).then((value) => console.log("fulfilled", value, calls));
Promise.resolve(void 0).then((value) => console.log("undefined", value));
console.log("sync", calls);
