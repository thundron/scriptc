const words = ["a", "b", "c"];
const removedWords = words.splice(1, 1, "x");
console.log(words.join("|"), removedWords.join("|"));

const numbers = [1, 2, 3];
console.log(numbers.splice(-1, 0, 9).join("|"), numbers.join("|"));
console.log(numbers.splice(99, 5, 8).join("|"), numbers.join("|"));
console.log(numbers.splice(NaN, Infinity, 7).join("|"), numbers.join("|"));

const bools = [true, false];
console.log(bools.splice(0, 2, false).join("|"), bools.join("|"));

const nested = [[1], [2], [3]];
const alias = nested[0]!;
const removedNested = nested.splice(1, 1, alias);
console.log(nested[0] === nested[1], removedNested[0]![0], nested.length);

let order = "";
const ordered = ["first", "second"];
function start(): number { order += "s"; return 1; }
function count(): number { order += "c"; return 0; }
function item(): string { order += "i"; return ordered[0]!; }
ordered.splice(start(), count(), item());
console.log(order, ordered.join("|"));

const values = JSON.parse('{"secret":false,"__proto__":1,"0":"zero"}') as Record<string, unknown>;
console.log(Object.hasOwn(values, "secret"), Object.hasOwn(values, "missing"));
console.log(Object.hasOwn(values, "__proto__"), Object.hasOwn(values, 0));
const numeric: Record<string, number> = {};
numeric["x"] = 1;
console.log(Object.hasOwn(numeric, "x"), Object.hasOwn(numeric, "toString"));
