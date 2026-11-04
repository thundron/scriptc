// Checked-dynamic switches use strict equality and ordinary switch jumps.
let trace: string[] = [];
function probe(value: unknown): unknown {
  trace.push(`test:${typeof value}`);
  return value;
}
function describe(value: unknown): string {
  let result = "";
  choose: switch (value) {
    case probe("one"):
      result += "string";
      if (result.length > 0) break choose;
      result += "wrong";
      break;
    default:
      result += "default";
    case probe(1):
      result += ":number";
    case probe(true):
      result += ":boolean";
      break;
    case undefined:
      result = "undefined";
      break;
    case null:
      result = "null";
  }
  return result;
}
const values: unknown[] = ["one", 1, true, false, "1", undefined, null, 2];
for (const value of values) {
  trace = [];
  console.log(describe(value), trace.join(","));
}

let count = 0;
loop: for (const value of values) {
  switch (value) {
    case "one": continue;
    case 1:
      try { count++; break; } finally { count += 10; }
    case true:
      for (let i = 0; i < 3; i++) { if (i === 1) break; count++; }
      break;
    case false: break loop;
    default: count += 100;
  }
}
console.log("count", count);

// Strict equality never coerces a string case into the numeric discriminant.
function equality(value: unknown): string {
  switch (value) {
    case "1": return "string";
    case 1: return "number";
    case true: return "boolean";
    default: return "other";
  }
}
console.log(equality("1"), equality(1), equality(true), equality(false));

// Defaults are chosen after testing every case, regardless of their position.
function choose(value: unknown): number {
  switch (value) {
    default: return 0;
    case probe(1): return 1;
    case probe(2): return 2;
  }
}
trace = [];
console.log(choose(2), trace.join(","));
trace = [];
console.log(choose(3), trace.join(","));
