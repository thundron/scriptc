// console.log beyond scalars: Node renders every non-string argument
// through util.inspect at depth 2 (formatWithOptions' rest-arg rule) —
// arrays, records, unions, Maps/Sets, undefined/null, regexes, symbols,
// class instances. Plain STRING arguments print verbatim (never quoted);
// nested strings quote — the classic console.log vs inspect distinction.
import * as output from "node:console";
import { log as print, info, debug, error, warn } from "console";

print("imported %s %d", "log", 3);
info("imported info", { a: 1 });
debug("imported debug", [1, 2]);
error("imported error", { ok: false });
warn("imported warn", ["w"]);
output.log("namespace", { n: -0 });
output.error("namespace stderr");
function consoleModule(): typeof output {
  console.log("receiver first");
  return output;
}
function logArgument(): string {
  console.log("argument second");
  return "argument";
}
consoleModule().log(logArgument());
consoleModule().log("formatted %s", logArgument());
function shadowPrint(print: (value: string) => void): void {
  print("shadow");
}
shadowPrint((value: string) => console.log("local", value));

// The motivating shapes: a find() miss union and plain undefined.
const xs = [1, 2, 3];
const found = xs.find((x) => x > 10);
console.log(found);
const hit = xs.find((x) => x > 1);
console.log(hit);
console.log(undefined);
console.log(null);

// Unions dispatch per arm at runtime: the string arm prints RAW, the
// number arm prints as a number, unit arms print their names.
function pick(n: number): string | number | undefined {
  if (n === 0) return "raw string arm";
  if (n === 1) return 42.5;
  return undefined;
}
console.log(pick(0));
console.log(pick(1));
console.log(pick(2));

// Arrays and records, nested; a string INSIDE a composite quotes.
console.log(["x", "y"]);
console.log([1, 2, 3]);
console.log({ a: 1, b: "two", c: [true, null] });
console.log({ outer: { inner: { deepest: 1 } } }); // depth 2: [Object]
console.log([]);
console.log({});

// Maps, Sets, regexes, symbols, tuples, index-signature records.
console.log(new Map([["k", 1]]), new Set([1, 2]));
console.log(/ab+c/gi);
console.log(Symbol("tag"));
const pair: [number, string] = [1, "a"];
console.log(pair);
const bag: Record<string, number> = { one: 1, two: 2 };
console.log(bag);

// Class instances print their constructor name and fields.
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
console.log(new Point(1, 2));

// Multiple arguments join with single spaces; top-level strings stay raw.
console.log("mixed:", { n: -0 }, [-0], "and", 7, true);
console.log();

// error/warn (stderr) and info/debug (stdout aliases of log) share the
// exact formatting.
console.error("err", ["e"]);
console.warn("warn", { w: true });
console.info("info", { a: 1 });
console.debug("debug", [1]);

// A leading format string keeps util.format semantics — %d/%s/%O
// substitution does not regress, composites ride the same rendering.
console.log("fmt %d and %s", 3, { deep: { deeper: { deepest: 1 } } });
console.log("%O then rest", { a: [1, 2] }, ["tail"]);
console.log("%s", pick(0));
console.log("%s", pick(2));

// Wide arrays exercise the layout engine's wrap and grid grouping.
console.log([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140]);
console.log(["a-long-string-element", "another-long-string-element", "a-third-long-string-element"]);
