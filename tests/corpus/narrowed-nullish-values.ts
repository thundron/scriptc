// @transform-types
type Failure = { degrade: string };
function rewrite(answer: string | Failure | null, projected: string | undefined): string | undefined {
  if (answer !== null && typeof answer === "object") return answer.degrade;
  return answer ?? projected;
}
console.log(rewrite("", "fallback"), rewrite(null, "fallback"), rewrite({ degrade: "reason" }, undefined));
console.log(rewrite(null, undefined) === undefined);

const events: string[] = [];
function fallback(value: number | undefined): number | undefined { events.push("fallback"); return value; }
function withNumber(value: string | Failure | null | undefined): string | number | undefined {
  if (value !== null && typeof value === "object") return value.degrade;
  return value ?? fallback(7);
}
console.log(withNumber("kept"), events.join(","));
console.log(withNumber(null), events.join(","));
console.log(withNumber(undefined), events.join(","));
console.log(withNumber(""), events.join(","));

function retainFalsy(value: boolean | number | Failure | undefined): boolean | number | string {
  if (typeof value === "object") return value.degrade;
  return value ?? "missing";
}
console.log(retainFalsy(false), retainFalsy(0), retainFalsy(2), retainFalsy(undefined));

let calls = 0;
function effectful(value: string | null): string | null { calls++; return value; }
function widen(value: string | null): string | number | undefined {
  return effectful(value) ?? fallback(undefined);
}
console.log(widen("once"), calls, events.length);
console.log(widen(null) === undefined, calls, events.length);

class Item { constructor(readonly id: number) {} }
function choose(value: Item | string | null, replacement: Item | undefined): Item | undefined {
  if (typeof value === "string") return replacement;
  return value ?? replacement;
}
const item = new Item(9);
console.log(choose(item, undefined) === item, choose(null, item) === item);

interface Wide { value: number; extra: string }
interface Narrow { value: number }
function copy(value: Wide | null, replacement: Narrow | undefined): Narrow | undefined {
  return value ?? replacement;
}
console.log(copy({ value: 4, extra: "discarded" }, undefined)?.value, copy(null, { value: 6 })?.value);
