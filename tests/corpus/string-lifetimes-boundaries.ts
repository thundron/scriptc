function size(value: string): number { return value.length; }
function copy(value: string): string { return value; }
function pass(value: string, callback: (text: string) => number): number { return callback(value); }
const callback: (text: string) => number = size;
console.log(callback("indirect"), pass("callback", size));
console.log(["one", "second", ""].map(size).join(","));
let returned = copy("retained");
returned += ":suffix";
console.log(returned);
class Reader {
  read(value: string): number { return value.length; }
  keep(value: string): string { return value; }
}
class Child extends Reader {
  read(value: string): number { return value.indexOf(":"); }
}
const readers: Reader[] = [new Reader(), new Child()];
for (const reader of readers) console.log(reader.read("a:b"), reader.keep("owned"));
function capture(value: string): () => string { return () => value; }
const saved = capture("closure");
console.log(saved());
function store(value: string, values: string[]): void { values.push(value); }
const values: string[] = [];
store("stored", values);
console.log(values.join(","));
function replaceParameter(value: string): string {
  value += ":changed";
  return value.slice(0);
}
console.log(replaceParameter("parameter"));
function normalize(value: string, form: string): string { return value.normalize(form); }
function fail(): number { throw new Error("argument"); }
try { console.log("temporary".repeat(2).charAt(fail())); }
catch (error) { if (error instanceof Error) console.log(error.message); }
try { console.log(normalize("text", "invalid")); }
catch (error) { if (error instanceof Error) console.log(error.name); }
function withFinally(value: string): string {
  try { return value.trim(); }
  finally { console.log(value.length); }
}
console.log(withFinally("  kept  "));
function override(value: string): string {
  try { return value.toUpperCase(); }
  finally { return value.toLowerCase(); }
}
console.log(override("MiXeD"));
function nestedThrow(value: string): void {
  try {
    try { console.log(normalize(value, "invalid")); }
    finally { console.log(value.startsWith("a")); }
  } catch (error) {
    if (error instanceof Error) console.log(error.name, value.endsWith("c"));
  }
}
nestedThrow("abc");
async function later(value: string): Promise<string> {
  await Promise.resolve();
  return value.toUpperCase();
}
console.log(await later("async"));
function* chunks(value: string): Generator<string, string, unknown> {
  yield value.slice(0, 2);
  return value.slice(2);
}
const generator = chunks("generator");
console.log(generator.next().value, generator.next().value);
