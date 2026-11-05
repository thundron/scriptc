// Slice copies, subarray aliases, and in-place copies preserve overlap.
// Bulk set throws catchable RangeErrors for invalid destination ranges.
function hex(x: Uint8Array): string {
  return Buffer.from(x).toString("hex");
}

const b = new Uint8Array([1, 2, 3, 4, 5]);
console.log("s1", hex(b.slice(-3, -1)));
console.log("s2", hex(b.slice(1.9, 3.2)));
console.log("s3", hex(b.slice(2)));
console.log("s4", hex(b.slice()));
console.log("s5", hex(b.slice(4, 2)));
console.log("s6", hex(b.slice(-99, 99)));

const sl = b.slice(0, 2);
sl[0] = 42;
console.log("copy", b[0], sl[0]);

console.log("sub", hex(b.subarray(1, 3)));
console.log("sub2", hex(b.subarray(-2)));

const dst = new Uint8Array(5);
dst.set(new Uint8Array([7, 8]), 3);
dst.set(new Uint8Array([9]));
console.log("set", hex(dst));
try {
  dst.set(new Uint8Array([1, 2, 3]), 4);
  console.log("no-throw");
} catch (e) {
  if (e instanceof RangeError) {
    console.log("range", e.message);
  } else {
    console.log("not-a-rangeerror");
  }
}

const overlap = new Uint8Array([1, 2, 3, 4, 5]);
console.log("within-right", overlap.copyWithin(1, 0, 4) === overlap, hex(overlap));
console.log("within-left", hex(overlap.copyWithin(0, 2)));
console.log("relative", hex(overlap.copyWithin(-2, -4, -2)));
console.log("clamp", hex(overlap.copyWithin(-99, 2.9, Infinity)));
console.log("empty", hex(overlap.copyWithin(Infinity, -Infinity, NaN)));
const view = overlap.subarray(1, 4);
console.log("view", view.copyWithin(1, 0, 2) === view, hex(overlap));
console.log("undefined", hex(view.copyWithin(0, 1, undefined)));
console.log("zero-length", new Uint8Array().copyWithin(0, 0).length);

const wide = new Float64Array([1.25, -0, NaN, Infinity, -2.75]);
wide.copyWithin(1, 0, 4);
console.log("wide", wide[0], wide[1], Object.is(wide[2], -0), Number.isNaN(wide[3]), wide[4]);
const signed = new Int32Array([-1, 2, -3, 4]);
signed.copyWithin(1, 0, 3);
console.log("signed", signed[0], signed[1], signed[2], signed[3]);
const unsigned = new Uint32Array([4294967295, 2, 3]);
unsigned.copyWithin(0, 1);
console.log("unsigned", unsigned[0], unsigned[1], unsigned[2]);
const floats = new Float32Array([0.25, 0.5, 0.75]);
floats.copyWithin(1, 0);
console.log("float32", floats[0], floats[1], floats[2]);

let order = "";
function receiver(): Uint8Array { order += "r"; return overlap; }
function index(label: string, value: number): number { order += label; return value; }
function absent(): undefined { order += "e"; return undefined; }
receiver().copyWithin(index("t", 0), index("s", 2), absent());
console.log("order", order, hex(overlap));

const cross = new Uint8Array(new Float64Array([257.9, -1, NaN, Infinity]));
console.log("cross-new", hex(cross));
cross.set(new Int32Array([258, -2]), 1);
console.log("cross-set", hex(cross));
const widened = Float64Array.from(new Uint8Array([255, 3]));
console.log("cross-from", widened[0], widened[1]);
cross.set([12, 13], undefined);
console.log("array-set", hex(cross));

let current = new Uint8Array([1, 2, 3, 4]);
const before = current;
function switchReceiver(): number { current = new Uint8Array([8, 9]); return 2; }
current.copyWithin(0, switchReceiver());
console.log("saved-receiver", hex(before), hex(current));
const shared = new Uint8Array([1, 2, 3, 4, 5]);
shared.subarray(1).set(shared.subarray(0, 4));
console.log("overlap-set", hex(shared));
