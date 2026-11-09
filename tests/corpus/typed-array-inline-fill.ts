function fill64(value: number, start: number, end: number): void {
  const a = new Float64Array([1,2,3,4,5]);
  const result = a.fill(value,start,end);
  let text = result === a ? "same" : "different";
  for (const x of a) text += " " + (Object.is(x,-0) ? "-0" : String(x));
  console.log(text);
}
const bounds = [NaN, -Infinity, -7, -4.7, -0.5, -0, 0, 1.7, 3, 5, 8, Infinity];
const values = [-0, NaN, Infinity, -Infinity, 2.5, -1.5, 1e300];
for (let i=0;i<bounds.length;i++) for(let j=0;j<bounds.length;j++) fill64(values[(i+j)%values.length]!,bounds[i]!,bounds[j]!);
const a = new Float32Array(4); a.fill(-0); console.log(Object.is(a[3],-0));
a.fill(1/3,1,-1);console.log(a[1],a[2]);
const b = new Int32Array(4); b.fill(4294967297);console.log(b.join(","));
b.fill(NaN);console.log(b.join(","));
const c = new Uint32Array(4);c.fill(-1);console.log(c.join(","));
const d = new Int16Array(4);d.fill(65539,1);console.log(d.join(","));
const e = new Uint16Array(4);e.fill(-1,1,-1);console.log(e.join(","));
const f = new Int8Array(4);f.fill(129);console.log(f.join(","));
const g = new Uint8ClampedArray(6);g.fill(2.5,0,2);g.fill(3.5,2,4);g.fill(NaN,4);console.log(g.join(","));
const shared = new Float64Array(new SharedArrayBuffer(32));shared.fill(7.5,1,-1);console.log(shared.join(","));
const owner = new Float64Array([1,2,3,4,5]);const view = owner.subarray(1,4);view.fill(9,-2);console.log(owner.join(","));
let receiver = new Float64Array(3);const original = receiver;
function replace():number {receiver=new Float64Array(2);return 5;}
console.log(original === receiver.fill(replace()),original.join(","),receiver.join(","));
console.log(new Float64Array(0).fill(3).length);
let only = new Float64Array(3);
function releaseReceiver():number {only=new Float64Array(2);return 6;}
const kept = only.fill(releaseReceiver());
console.log(kept.length,kept.join(","),only.length,only.join(","));
const u8 = new Uint8Array([1,2,3,4]);u8.fill(257,-2,9);console.log(u8.join(","));
const half = new Float16Array(4);half.fill(1/3);console.log(half.join(","));
for(const value of [NaN,Infinity,-Infinity,-0,1e300,-1e300,4294967295.5,-4294967295.5]) {b.fill(value);console.log(b.join(","));}
const absent64 = new Float64Array([1,2]);
// @ts-expect-error Missing fill values undergo ToNumber(undefined).
absent64.fill();console.log(absent64.join(","));
const absent32 = new Float32Array([1,2]);
// @ts-expect-error Explicit undefined is also a missing numeric value.
absent32.fill(undefined);console.log(absent32.join(","));
// @ts-expect-error Integer element conversion maps NaN to zero.
b.fill();console.log(b.join(","));
