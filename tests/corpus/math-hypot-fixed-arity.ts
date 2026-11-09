function two(x: number, y: number): number { return Math.hypot(x, y); }
function three(x: number, y: number, z: number): number { return Math.hypot(x, y, z); }
const values = [0, -0, 3, -4, 1e308, -1e308, 1e-300, 5e-324, Infinity, -Infinity, NaN];
let count = 0;
for (const x of values) for (const y of values) {
  if (!Object.is(two(x, y), Math.hypot(...[x, y]))) throw new Error("hypot2 changed rounding");
  for (const z of values) {
    if (!Object.is(three(x, y, z), Math.hypot(...[x, y, z]))) throw new Error("hypot3 changed rounding");
    count++;
  }
}
let state = 1;
for (let i=0; i<128; i++) {
  state = (state * 1664525 + 1013904223) >>> 0;
  const x = state / 17, y = (state - 2147483648) / 19, z = (state % 997) * 1e-100;
  if (!Object.is(two(x,y),Math.hypot(...[x,y])) || !Object.is(three(x,y,z),Math.hypot(...[x,y,z]))) throw new Error("finite hypot changed rounding");
}
let order = "";
function argument(name: string, value: number): number { order += name; return value; }
console.log("hypot", count, Math.hypot(), Math.hypot(3), Math.hypot(1,2,3,4));
console.log(three(argument("x", Infinity),argument("y",NaN),argument("z",4)), order);
console.log(Object.is(two(-0,0), 0));
const firstClass = Math.hypot;
console.log(firstClass(3,4), firstClass(2,3,6));
let conversions="";
const numeric={valueOf():number {conversions+="coerce";return 3;}};
function later():number {conversions+="later ";return 4;}
function coerced(x:unknown):number {
  // @ts-expect-error Math.hypot performs ToNumber on dynamic operands.
  return Math.hypot(x,later());
}
console.log(coerced(numeric),conversions);
const bad={valueOf():number {throw new Error("coercion");}};
function withInfinity(x:unknown):number {
  // @ts-expect-error Infinity does not suppress a later ToNumber exception.
  return Math.hypot(Infinity,x);
}
try {withInfinity(bad);} catch {console.log("all converted");}
