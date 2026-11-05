const effects: string[] = [];
function mark(label: string): void { effects.push(label); }

function direct(): void { return mark("direct"); }
function throughFinally(): void {
  try { return mark("try-return"); }
  finally { mark("finally"); }
}
function throughCatch(): void {
  try { throw new Error("caught"); }
  catch (error) {
    if (error instanceof Error) return mark(`catch-return:${error.message}`);
  } finally { mark("catch-finally"); }
}
function nested(): void {
  try {
    try { return mark("nested-return"); }
    finally { mark("inner-finally"); }
  } finally { mark("outer-finally"); }
}
function replaceReturn(): void {
  try { return mark("replaced-return"); }
  finally { return mark("replacement"); }
}
function fail(): void { mark("throw-expression"); throw new RangeError("void-call"); }
function expressionThrows(): void {
  try { return fail(); }
  finally { mark("throw-finally"); }
}
function finallyThrows(): void {
  try { return mark("before-finally-throw"); }
  finally { mark("finally-throw"); throw new Error("finally"); }
}
function suppressThrow(): void {
  try { return fail(); }
  finally { return mark("suppress-throw"); }
}
function captured(label: string): () => void {
  const retained = [label];
  return (): void => {
    try { return mark(retained[0]!); }
    finally { mark("closure-finally"); }
  };
}
function localVoid(value: number): void {
  const result = { label: `local:${value}` };
  const write = (): void => { mark(result.label); };
  try { return write(); }
  finally { mark(`local-finally:${result.label}`); }
}
function show(label: string, fn: () => void): void {
  effects.length = 0;
  try { fn(); console.log(label, "undefined", effects.join(",")); }
  catch (error) {
    if (error instanceof Error) console.log(label, error.name, error.message, effects.join(","));
  }
}
show("direct", direct);
show("finally", throughFinally);
show("catch", throughCatch);
show("nested", nested);
show("replace", replaceReturn);
show("expression-throws", expressionThrows);
show("finally-throws", finallyThrows);
show("suppress", suppressThrow);
show("closure", captured("captured"));
show("local", () => localVoid(17));
let count = 0;
function increment(): void { count++; }
function repeat(): void {
  try { return increment(); }
  finally { count += 2; }
}
for (let i = 0; i < 100; i++) repeat();
console.log("repeated", count);
