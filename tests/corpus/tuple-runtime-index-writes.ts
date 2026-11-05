type Vector = [number, number, number];
function set(v: Vector, i: number, x: number): void { v[i] = x; }
function read(v: Vector, i: number): number | undefined { return v[i]; }
function increment(v: Vector, i: number): number { return v[i]++; }
const vector: Vector = [1, 2, 3];
const alias = vector;
set(vector, 1, 7);
console.log(vector.join(","), alias[1], vector.length);
console.log(increment(vector, 0), vector[0]);
set(vector, 4, 9);
console.log(vector.length, JSON.stringify(alias), String(read(vector, 3)), read(vector, 4));
console.log([...vector].join(":"));
const held: {point: Vector} = {point: [4, 5, 6]};
set(held.point, 2, 8);
console.log(JSON.stringify(held));
function generic<T>(values: [T, T, T], i: number, value: T): void { values[i] = value; }
const words: [string, string, string] = ["a", "b", "c"];
generic(words, 1, "z");
console.log(words.join(","));
let order = "";
function receiver(): Vector { order += "r"; return vector; }
function index(): number { order += "i"; return 2; }
function rhs(): number { order += "v"; return 20; }
receiver()[index()] = rhs();
console.log(order, vector[2]);
set(vector, -1, 30);
set(vector, 1.5, 40);
console.log(read(vector, -1), read(vector, 1.5), vector.length, Object.keys(vector).join(","));
