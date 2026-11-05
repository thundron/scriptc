// Uint8Array/Buffer values crossing into `unknown`: the checked-dynamic tree's bytes kind —
// retention on the way in, checked-cast extraction sharing the view on
// the way out, Node-exact String() (elements
// joined) and JSON.stringify (the index-keyed object form). The stdin
// toBytes(chunk: unknown) pattern.

function toBytes(chunk: unknown): Uint8Array {
  if (typeof chunk === "string") return new TextEncoder().encode(chunk);
  return new TextEncoder().encode(String(chunk));
}

const src = new Uint8Array([104, 105, 33]);
const u: unknown = src;
const back = u as Uint8Array;
console.log(back.length, back[0], back[1], back[2]);
console.log(String(u));
console.log(toBytes("hey").length, toBytes(u).length, toBytes(7).length);

// typeof over the bytes kind: every scalar kind test misses.
console.log(typeof u === "string", typeof u === "number", typeof u === "undefined");
console.log(u === null, u !== undefined);

// Under an unknown-valued index signature, and through unknown params.
const scratch: Record<string, unknown> = {};
scratch.buf = new Uint8Array([1, 2, 3]);
console.log(String(scratch.buf), (scratch.buf as Uint8Array).length);
console.log(JSON.stringify(scratch));

// Repeated extraction preserves the view and its byte contents.
const again = scratch.buf as Uint8Array;
console.log(again[0] + again[1] + again[2]);

// Buffer shares bytes<u8> storage while preserving its runtime brand.
const buf = Buffer.from("hi");
const ub: unknown = buf;
console.log((ub as Uint8Array).length, (ub as Uint8Array)[0]);

// Empty payloads.
const empty: unknown = new Uint8Array(0);
console.log(String(empty) === "", (empty as Uint8Array).length);
