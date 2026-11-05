export {};

function project<T>(value: T, get: (value: T) => { text: string }): string {
  const { text } = get(value);
  return text;
}
console.log(project(1, (n) => ({ text: String(n) })), project("two", (s) => ({ text: s })));

function patterns<T>(value: T, alternate: T): T {
  const { nested: { first }, list: [second] } = { nested: { first: value }, list: [alternate] };
  let { chosen } = { chosen: first };
  if (second !== undefined) chosen = second;
  return chosen;
}
console.log(patterns(3, 4), patterns("three", "four"));

function arrayPattern<T>(value: T): T {
  const [first] = [value];
  return first!;
}
console.log(arrayPattern(5), arrayPattern("five"), arrayPattern(false));

function varPattern<T>(value: T): T {
  if (true) {
    var { first } = { first: value };
  }
  var { first } = { first: value };
  return first;
}
console.log(varPattern(6), varPattern("six"));

function closurePattern<T>(value: T): () => T {
  const { first } = { first: value };
  return () => first;
}
const number = closurePattern(7);
const text = closurePattern("seven");
console.log(number(), text());

function loopPatterns<T>(values: T[]): (() => T)[] {
  const readers: (() => T)[] = [];
  for (const value of values) {
    const { first } = { first: value };
    readers.push(() => first);
  }
  return readers;
}
for (const read of loopPatterns([8, 9, 10])) console.log(read());
for (const read of loopPatterns(["eight", "nine", "ten"])) console.log(read());

// A lexical pattern's binding may share a spelling with an outer var,
// but it must never acquire the function-scoped var's storage or lifetime.
function shadowPattern<T>(value: T): T {
  var result = value;
  {
    const { result } = { result: "inner" };
    console.log(result);
  }
  return result;
}
console.log(shadowPattern(11), shadowPattern("eleven"));
