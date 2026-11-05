function inner(): Error { return new Error("boom"); }
function outer(): Error { return inner(); }
const error = outer();
const stack = error.stack!;
console.log(stack.split("\n")[0]);
console.log(stack.includes("at inner"), stack.includes("at outer"));
console.log(stack === error.stack);
error.message = "changed";
console.log(error.stack === stack);
function* generator() {
  yield new Error("before");
  yield new Error("after");
}
const iterator = generator();
const before = iterator.next().value as Error;
const after = iterator.next().value as Error;
console.log(before.stack!.includes("at generator"), after.stack!.includes("at generator"));
iterator.next();
function fail(): void { throw new Error("failure"); }
try { fail(); } catch {}
const later = inner().stack!;
console.log(later.includes("at inner"), later.includes("at fail"));
