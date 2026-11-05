export {};

// Templates with no regex captures leave numbered and named tokens literal.
const subjects = ["", "abc", "aaaa", "a.b.a", "a\0b\0a", "é/你好/😀"];
const needles = ["a", "aa", ".", "missing", "\0", "é", "😀"];
const templates = ["", "X", "$", "$$", "$&", "$`", "$'", "$1", "$01", "$99", "$<name>", "$$&", "$$$&", "$`<$&>$'", "é😀$$尾"];
for (const subject of subjects) {
  for (const needle of needles) {
    for (const template of templates) {
      console.log(JSON.stringify(subject.replace(needle, template)), JSON.stringify(subject.replaceAll(needle, template)));
    }
  }
}

// Empty matches advance one UTF-16 position, including the final position.
for (const subject of ["", "abc", "é中", "\0"]) {
  for (const template of templates) {
    console.log(JSON.stringify(subject.replace("", template)), JSON.stringify(subject.replaceAll("", template)));
  }
}

console.log("ababa".replaceAll("aba", "x"));
console.log("aaaaa".replaceAll("aa", "aaa"));
console.log("$&".replace("$&", "$$&"));
console.log("ab".replace("b", "$`$'$&"));
console.log("a\r\nb".replaceAll("\r\n", "\n"));

let effects = "";
function subject(): string { effects += "S"; return "a-a"; }
function search(): string { effects += "N"; return "a"; }
function replacement(): string { effects += "R"; return "b"; }
console.log(subject().replace(search(), replacement()), effects);
effects = "";
console.log(subject().replaceAll(search(), replacement()), effects);

function replacer(): (match: string, offset: number, original: string) => string {
  effects += "F";
  return (match, offset, original) => {
    effects += String(offset);
    return "[" + match + ":" + String(offset) + ":" + original + "]";
  };
}
effects = "";
console.log(subject().replaceAll(search(), replacer()), effects);
effects = "";
console.log(subject().replace(search(), replacer()), effects);
effects = "";
console.log(subject().replaceAll("z", replacer()), effects);

// Callback results do not interpret replacement-template metacharacters.
console.log("x-x".replaceAll("x", () => "$&$$$`$'"));
console.log("abc".replaceAll("", (match: string, offset: number, original: string) => String(offset) + match + original.length));
console.log("😀x😀x".replaceAll("x", (match: string, offset: number) => match + String(offset)));
console.log("😀x😀".replaceAll("😀", (match: string, offset: number) => "[" + match + String(offset) + "]"));
console.log("a-a".replaceAll("a", (match: string) => match.toUpperCase()));

let original = "a-a";
let needle = "a";
console.log(original.replaceAll(needle, (match: string, offset: number, input: string) => {
  original = "other";
  needle = "-";
  return match + String(offset) + input;
}));
console.log(original, needle);

let count = 0;
try {
  "aaa".replaceAll("a", () => {
    count++;
    if (count === 2) throw new Error("replacement failed");
    return "b";
  });
} catch (error) { if (error instanceof Error) console.log(error.message, count); }
console.log("a-a".replaceAll("a", (match: string, offset: number) => {
  return "x-x".replaceAll("x", match + String(offset));
}));

function optionalSearch(value: string | undefined): string {
  // @ts-expect-error JavaScript coerces undefined search values.
  return "undefined x undefined".replaceAll(value, "yes");
}
console.log(optionalSearch(undefined), optionalSearch("x"));
function optionalReplacement(value: string | null | undefined): string {
  // @ts-expect-error JavaScript coerces nullish replacement values.
  return "a-a".replaceAll("a", value);
}
console.log(optionalReplacement("b"), optionalReplacement(null), optionalReplacement(undefined));
// @ts-expect-error JavaScript coerces primitive arguments.
console.log("12 true 12".replaceAll(12, false));
// @ts-expect-error JavaScript permits omitted replacement arguments.
console.log("a-a".replaceAll("a"));
// @ts-expect-error JavaScript permits omitted search arguments.
console.log("undefined".replace());

function sideEffectUndefined(): undefined { effects += "U"; return undefined; }
effects = "";
// @ts-expect-error JavaScript coerces undefined arguments after evaluating them.
console.log(subject().replaceAll(sideEffectUndefined(), sideEffectUndefined()), effects);

// Exercise repeated helper calls, closure ownership, and long unchanged spans.
const long = "é".repeat(1024) + "-" + "中".repeat(1024);
console.log(long.replaceAll("-", "😀").length, long.replaceAll("z", "x") === long);
let total = 0;
for (let index = 0; index < 64; index++) {
  total += "a-a-a".replaceAll("a", (match: string, offset: number) => match + String(index + offset)).length;
}
console.log(total);

// Existing regex lowering remains separate from string search.
console.log("aAa".replace(/a/gi, "b"), "aAa".replaceAll(/a/gi, "b"));
