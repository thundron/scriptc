function matches(subject: string, pattern: RegExp): void {
  console.log(JSON.stringify(subject.match(pattern)));
}

matches("hello world hello", /(hello|world)/g);
matches("no matches", /xyz/g);
matches("", /x/g);
matches("", /(?:)/g);
matches("ab", /(?:)/g);
matches("😀x", /(?:)/gu);
matches("😀x", /(?:)/g);
matches("aa ba", /a/gy);
matches("ba", /a/gy);
matches("aaa", /(?:)/gy);
const repeated = /a/g;
matches("aba", repeated);
matches("aba", repeated);
matches("HELLO\nhello", /^hello/gim);
matches("one two", /(?<word>\w+)/g);
console.log(JSON.stringify("one two".match(/\w+/g)));
const globalMatch = "one two".match(/(?<word>\w+)/g)!;
console.log(globalMatch.groups === undefined, globalMatch.index === undefined, globalMatch.input === undefined);
console.log(JSON.stringify(/(one) (two)/.exec("one two")));
