const originalLimit = Error.stackTraceLimit;
console.log(originalLimit);
function first(): Error { return second(); }
function second(): Error { return third(); }
function third(): Error { return new Error("captured"); }
for (const limit of [0, -1, NaN, 1, 2, 2.8]) {
  Error.stackTraceLimit = limit;
  const error = first();
  Error.stackTraceLimit = 20;
  const lines = error.stack!.split("\n");
  console.log(lines.length, lines[0], error.stack!.includes("at third"), error.stack!.includes("at second"));
}
Error.stackTraceLimit = originalLimit;
console.log(Error.stackTraceLimit);
