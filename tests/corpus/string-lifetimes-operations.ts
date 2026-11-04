function compare(left: string, right: string): string {
  const equal = left === right;
  const different = left !== right;
  const before = left < right;
  const after = left > right;
  return String(equal) + ":" + String(different) + ":" + String(before) + ":" + String(after);
}
function measure(value: string, needle: string): string {
  const size = value.length;
  const first = value.charAt(0);
  const code = value.charCodeAt(0);
  const index = value.indexOf(needle);
  const includes = value.includes(needle, 1);
  const starts = value.startsWith(needle);
  const ends = value.endsWith(needle);
  return String(size) + ":" + first + ":" + String(code) + ":" + String(index) + ":" + String(includes) + ":" + String(starts) + ":" + String(ends);
}
function transform(value: string, fill: string): string[] {
  return [
    value.slice(1, -1), value.substring(1, 4), value.repeat(2),
    value.trim(), value.trimStart(), value.trimEnd(),
    value.padStart(8, fill), value.padEnd(8, fill),
    value.toUpperCase(), value.toLowerCase(), value.normalize("NFC"),
  ];
}
function relay(value: string, needle: string): string { return measure(value, needle); }
const values = ["", "plain", " café ", "e\u0301", "\u{1f642}", "\0x", "\uffff"];
for (const value of values) {
  console.log(relay(value, "a"));
  console.log(compare(value, value), compare(value, "z"));
  console.log(transform(value, ".:").join("|"));
}
function split(value: string, separator: string): string[] { return value.split(separator, 3); }
console.log(split("one:two:three:four", ":").join(","));
console.log(split("abc", "").join(","));
function points(value: string): string {
  let result = "";
  for (const point of value) result += point + ":";
  return result;
}
console.log(points("a\u{1f642}b"));
function canonical(value: string): string { return value.normalize("NFC"); }
const originals = ["abc", "e\u0301", ""];
const results: string[] = [];
for (const original of originals) results.push(canonical(original));
originals.length = 0;
console.log(results.join("|"));
function append(value: string, suffix: string): string { return value + suffix; }
let joined = append("", "first");
joined = append(joined, ":second");
console.log(joined);
function even(value: string, count: number): boolean {
  if (count === 0) return value.startsWith("ready");
  return odd(value, count - 1);
}
function odd(value: string, count: number): boolean {
  if (count === 0) return value.endsWith("ready");
  return even(value, count - 1);
}
console.log(even("ready", 7), odd("not-ready", 8));
