function size(value: string | undefined): number {
  return value === undefined ? -1 : value.length;
}
function transform(value: string | undefined): string {
  return value === undefined ? "missing" : value.trim().toUpperCase();
}
function pair(left: string | undefined, right: string | undefined): string {
  return transform(left) + ":" + transform(right);
}
function total(words: string[]): number {
  let sum = 0;
  for (let index = 0; index <= words.length; index++) sum += size(words[index]);
  return sum;
}
const words = [" first ", "", "\u{1f642}", "e\u0301"];
console.log(total(words));
console.log(pair(words[0], words[1]), pair(words[2], words[3]));
console.log(pair(words[4], words[0]));
const results = [transform(words[0]), transform(words[3])];
words.length = 0;
console.log(results.join("|"));
const sparse: string[] = [];
sparse[10000] = " distant ";
sparse[-1] = " property ";
console.log(transform(sparse[0]), transform(sparse[10000]), transform(sparse[-1]));
function replace(): string | undefined {
  sparse[10000] = "changed";
  return sparse[10000];
}
console.log(pair(sparse[10000], replace()), sparse[10000]);
function clearInside(value: string | undefined, source: string[]): string {
  source.length = 0;
  return transform(value);
}
console.log(clearInside(sparse[10000], sparse));
function make(): string[] { return [" temporary "]; }
console.log(transform(make()[0]), transform(make()[1]));
function fail(): string | undefined { throw new Error("later"); }
try { console.log(pair(make()[0], fail())); }
catch (error) { if (error instanceof Error) console.log(error.message); }
function normalize(value: string | undefined): string {
  return value === undefined ? "missing" : value.normalize("NFC");
}
const empty: string[] = [];
console.log(normalize(["e\u0301"][0]), normalize(empty[0]));
function indirect(callback: (value: string | undefined) => string, source: string[]): string {
  return callback(source[0]);
}
console.log(indirect(transform, [" callback "]));
const saved: (string | undefined)[] = [];
function keep(value: string | undefined): void { saved.push(value); }
const source = ["stored"];
keep(source[0]);
keep(source[1]);
source.length = 0;
console.log(transform(saved[0]), transform(saved[1]));
function joined(source: string[]): string {
  return pair(source[0], source[1]) + ":" + pair(source[1], source[0]);
}
console.log(joined(["one", "two"]));
