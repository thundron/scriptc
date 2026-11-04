export {};

const words: [string, string, string] = ["a", "b", "a"];
console.log(words.includes("a"), words.includes("z"));
console.log(words.indexOf("a"), words.lastIndexOf("a"));
for (const position of [-Infinity, -4, -2, -0, 0, 1, 2, 3, Infinity, NaN]) {
  console.log(words.includes("a", position), words.indexOf("a", position), words.lastIndexOf("a", position));
}
const asArray = words as readonly string[];
console.log(asArray.includes("b"), asArray.indexOf("b"), asArray.lastIndexOf("a"));
const heterogeneous: [string, number, number | undefined] = ["a", NaN, undefined];
console.log(heterogeneous.includes(NaN), heterogeneous.indexOf(NaN), heterogeneous.lastIndexOf(NaN));
console.log(heterogeneous.includes(undefined), heterogeneous.indexOf(undefined), heterogeneous.lastIndexOf(undefined));

let trace = "";
function source(): [string, string, string] { trace += "S"; return words; }
function needle(): string { trace += "N"; words[0] = "x"; return "x"; }
function position(): number { trace += "P"; words[1] = "x"; return 1; }
console.log(source().includes(needle(), position()), trace);
trace = "";
console.log(source().lastIndexOf(needle(), position()), trace);

const object = { id: 1 };
const references: [typeof object, typeof object] = [{ id: 1 }, object];
console.log(references.includes(object), references.indexOf(object), references.lastIndexOf(object));
console.log(references.includes({ id: 1 }), references.lastIndexOf({ id: 1 }));

const strings: string[] = ["a", "bb", "a", "😀", "bb"];
const equalValue = "b".repeat(2);
console.log(strings.lastIndexOf(equalValue), strings.lastIndexOf("missing"));
console.log(strings.lastIndexOf("😀"), strings.lastIndexOf("a", -2));
const sparse: string[] = new Array<string>(4);
sparse[1] = "a";
console.log(sparse.lastIndexOf("a"), sparse.lastIndexOf(""));
const bigints: bigint[] = [12345678901234567890n, 1n, 12345678901234567890n];
console.log(bigints.lastIndexOf(BigInt("12345678901234567890")), bigints.lastIndexOf(2n));
const booleans = [false, true, false];
console.log(booleans.lastIndexOf(false), booleans.lastIndexOf(true));
