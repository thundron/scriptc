const events: string[] = [];
function mark(value: string): string {
  events.push(value);
  return value;
}
const text = ["head"];
const middle = ["a", "b"];
console.log(text.push(mark("before"), ...middle, mark("after"), ...["tail"]));
console.log(text.join(","), events.join(","));
console.log(text.unshift("start", ...new Set(["x", "x", "y"]), "end"));
console.log(text.join(","));

const source = [1, 2];
const target = [0];
function mutateSource(): number {
  source[0] = 10;
  source.push(3);
  return 7;
}
console.log(target.push(...source, mutateSource(), ...source));
console.log(target.join(","), source.join(","));

const self = [1, 2];
console.log(self.push(0, ...self, 3, ...self));
console.log(self.join(","));
const front = [1, 2];
console.log(front.unshift(0, ...front, 3, ...front));
console.log(front.join(","));

let current = [4, 5];
const original = current;
function swap(): number {
  current = [8, 9];
  return 6;
}
console.log(current.push(...current, swap(), ...current));
console.log(original.join(","), current.join(","));

const failed = ["original"];
function fail(): string {
  throw new Error("argument failed");
}
try {
  failed.push("pending", ...["spread"], fail());
} catch (error) {
  if (error instanceof Error) console.log(error.message);
}
console.log(failed.join(","));
try {
  failed.unshift(...["spread"], fail(), "pending");
} catch (error) {
  if (error instanceof Error) console.log(error.message);
}
console.log(failed.join(","));

const sparse = new Array<number>(3);
sparse[1] = 4;
const copied: number[] = [];
console.log(copied.push(1, ...sparse, 2));
console.log(copied.length, copied[1], copied[2], copied[3], 1 in copied, 3 in copied);
console.log(copied.unshift(0, ...sparse, -1));
console.log(copied.length, copied[1], copied[2], copied[3], 1 in copied, 3 in copied);

interface Item { label: string }
const one: Item = { label: "one" };
const two: Item = { label: "two" };
const refs: Item[] = [one];
const refsSource: Item[] = [two, one];
console.log(refs.push(two, ...refsSource, one));
two.label = "changed";
console.log(refs.map((item) => item.label).join(","), refs[1] === two, refs[3] === one);

const optional: (string | undefined)[] = ["one", undefined];
const optionalTarget: (string | undefined)[] = [];
console.log(optionalTarget.push(undefined, ...optional, "last"));
console.log(optionalTarget.map((value) => value ?? "absent").join(","));

const empty: number[] = [];
const numbers: number[] = [7];
console.log(numbers.push(...empty, ...empty, 8), numbers.join(","));
console.log(numbers.unshift(6, ...empty, 5), numbers.join(","));

const booleans = [true];
console.log(booleans.unshift(false, ...booleans, true), booleans.join(","));

function receiver(): string[] {
  events.push("receiver");
  return text;
}
events.length = 0;
console.log(receiver().push(mark("left"), ...middle, mark("right")));
console.log(events.join(","));
