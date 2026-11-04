console.log(Buffer.isBuffer("text"), Buffer.isBuffer(1), Buffer.isBuffer(false));
console.log(Buffer.isBuffer(null), Buffer.isBuffer(undefined), Buffer.isBuffer(1n));
console.log(Buffer.isBuffer(Symbol.for("buffer")));
let trace = "";
function text(): string { trace += "called;"; return "data"; }
console.log(Buffer.isBuffer(text()), trace);
function fail(): string { throw new Error("argument"); }
try { Buffer.isBuffer(fail()); }
catch (e) { if (e instanceof Error) console.log(e.message); }
