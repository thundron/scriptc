export {};

const tuple: [number, number, number] = [1, 2, 3];
console.log(tuple.map((value, index) => {
  if (index === 0) tuple[1] = 20;
  if (index === 1) tuple[2] = 30;
  return value + index;
}).join(","));
console.log(tuple[0], tuple[1], tuple[2]);

let calls = "";
function receiver(): [number, number] { calls += "R"; return [4, 5]; }
function callback(): (value: number, index: number) => number[] {
  calls += "C";
  return (value, index) => { calls += String(index); return [value, value * 2]; };
}
console.log(receiver().flatMap(callback()).join(","), calls);

const mutable: [string, string, string] = ["a", "b", "c"];
console.log(mutable.flatMap((value, index) => {
  if (index === 0) mutable[1] = "B";
  if (index === 1) mutable[2] = "C";
  return [value];
}).join(","));

const names = ["fs", "path", "url"] as const;
console.log(names.flatMap(name => [name, "node:" + name]).join(","));
const mixed: readonly [number, string, boolean] = [7, "eight", true];
console.log(mixed.flatMap(value => [String(value)]).join(","));
console.log(mixed.flatMap(value => typeof value).join(","));

const optional: [number | undefined, number] = [undefined, 9];
console.log(optional.map(value => value === undefined ? "missing" : String(value)).join(","));
console.log(optional.flatMap(value => value === undefined ? [] : [value]).join(","));

const holes: [number, number] = [1, 2];
console.log(JSON.stringify(holes.flatMap(value => {
  const result: (number | undefined)[] = [, undefined, value + 10];
  return result;
})));

const object = { count: 1 };
const objects: [typeof object, typeof object] = [object, object];
const mapped = objects.map(value => value);
const flattened = objects.flatMap(value => [value]);
console.log(mapped[0] === object, flattened[1] === object);
object.count = 2;
console.log(mapped[0]!.count, flattened[1]!.count);

const selected: [number, number] = [10, 20];
function start(): number { selected[0] = 30; return 0; }
function end(): number { selected[1] = 40; return 2; }
console.log(selected.slice(start(), end()).join(","));
calls = "";
console.log(receiver().slice(1).join(","), calls);

let owner: [number, number] = [50, 60];
const previous = owner;
function replaceBinding(): (value: number) => number {
  owner = [70, 80];
  previous[1] = 90;
  return value => value;
}
console.log(owner.map(replaceBinding()).join(","), owner[0]);

let visited = "";
try {
  names.flatMap((value, index) => {
    visited += value;
    if (index === 1) throw new Error("stop");
    return [value];
  });
} catch (error) { if (error instanceof Error) console.log(error.message, visited); }

function generic<T>(value: T): T[] {
  const pair: [T, T] = [value, value];
  return pair.flatMap(item => [item]);
}
console.log(generic(12).join(","), generic("thirteen").join(","));
console.log(names.map(() => "x").join(""), names.flatMap((): number[] => []).length);
