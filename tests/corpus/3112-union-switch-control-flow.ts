// Union switches preserve case-test order, early exits and real fallthrough.
let trace: string[] = [];
function test(value: string | number | undefined): string | number | undefined {
  trace.push(`test:${value}`);
  return value;
}
function select(value: string | number | undefined): string {
  let out = "";
  selection: switch (value) {
    case test("a"):
      out += "a";
      if (trace.length > 0) break selection;
      out += "unreachable";
      break;
    default:
      out += "default";
    case test(2):
      out += ":two";
    case test(undefined):
      out += ":end";
      break;
    case test("last"):
      out = "last";
  }
  return out;
}
for (const value of ["a", "missing", 2, undefined, "last"] as (string | number | undefined)[]) {
  trace = [];
  console.log(select(value), trace.join(","));
}

// A test may change the binding, but the discriminant keeps its old value.
function snapshot(initial: string | number): string {
  let value = initial;
  function mutate(): string | number {
    trace.push("mutate");
    value = 42;
    return "no";
  }
  switch ((value)) {
    case mutate(): return "wrong";
    case "yes": return `yes:${value}`;
    case 42: return "forty-two";
    default: return "other";
  }
}
console.log(snapshot("yes"), snapshot(42));

// An unlabeled break belongs to the switch; continue belongs to the loop.
const values: (string | number)[] = ["skip", 2, "stop", 9];
let total = 0;
outer: for (let i = 0; i < values.length; i++) {
  const value = values[i]!;
  switch (value) {
    case "skip": continue;
    case "stop":
      try { break outer; } finally { console.log("finally-stop", total); }
    case 2:
      for (let j = 0; j < 2; j++) {
        if (j === 1) break;
        total += j + 1;
      }
      if (total > 0) break;
      total += 100;
      break;
    default: total += 1000;
  }
  total += 10;
}
console.log("total", total);

// Matching an empty case before default skips all later case tests.
function grouped(value: string | number | undefined): string {
  switch (value) {
    case test(1):
    default:
      return "group";
    case test(2):
      return "two";
  }
}
trace = [];
console.log(grouped(1), trace.join(","));
trace = [];
console.log(grouped(2), trace.join(","));

// A thrown case test prevents default and every later test/body.
function explode(): string { throw new Error("case-test"); }
try {
  const value: string | number = snapshot("yes");
  switch (value) {
    default: console.log("wrong-default"); break;
    case explode(): console.log("wrong-case"); break;
  }
} catch (error) {
  if (error instanceof Error) console.log(error.message);
}
