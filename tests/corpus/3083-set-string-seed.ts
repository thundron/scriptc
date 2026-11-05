export {};

function inspect(input: string): void {
  const values = new Set(input);
  console.log(JSON.stringify(input), values.size, JSON.stringify([...values]));
  console.log(values.has("a"), values.has("😀"), values.has("é"));
  values.add("a");
  values.delete("😀");
  values.add("😀");
  console.log(JSON.stringify([...values]));
}
for (const input of ["", "abba", "😀a😀b", "e\u0301é", "\uD800\uDC00\uD800\uDC00", "a\0a\0b"]) {
  inspect(input);
}
let calls = 0;
function seed(): string { calls++; return "abac"; }
const constructed = new Set<string>(seed());
console.log("once", calls, [...constructed].join(""));
const flags: ReadonlySet<string> = new Set("gimig");
console.log("flags", flags.size, flags.has("g"), flags.has("u"));
