// Callback-shape relaxations: expression-body arrow option callbacks
// (read: () => this-free push through a captured binding), union-typed
// chunks (push(more ? s : null) — the generator idiom), and listeners
// whose expression bodies return values (Node ignores listener returns).
import { Readable, Writable } from "node:stream";

const parts = ["alpha", "beta", "gamma"];
let i = 0;
const r = new Readable({ read: () => r.push(i < parts.length ? parts[i++]! : null) });
const got: string[] = [];
r.on("data", (c: Buffer) => got.push(c.toString()));
r.on("end", () => console.log("end:", got.join("|")));

const w = new Writable({
  write(chunk, enc, cb) {
    console.log("w:", chunk.toString());
    cb();
  },
});
let count = 0;
w.on("finish", () => (count = count + 100));
w.write(Buffer.from("bin"));
const tail: string | null = "tail-str";
w.write(tail !== null ? tail : Buffer.from("never"));
w.end(() => console.log("finished, count:", count));
console.log("sync");

// Native untyped stream chunks retain their Buffer brand, while ordinary
// Uint8Arrays and structured clones have the same byte storage without it.
function describeBuffer(value: unknown): void {
  console.log("buffer?", Buffer.isBuffer(value));
  if (Buffer.isBuffer(value)) console.log("buffer text", value.toString("utf8"));
}
describeBuffer(new Uint8Array([97, 98]));
describeBuffer("text");
describeBuffer(null);
describeBuffer(undefined);
describeBuffer(5);
describeBuffer(false);
describeBuffer([1, 2]);
describeBuffer({ type: "Buffer", data: [1, 2] });
const raw = new Readable({ read: () => { raw.push("bytes"); raw.push(null); } });
raw.on("data", (chunk: unknown) => {
  describeBuffer(chunk);
  describeBuffer(structuredClone(chunk));
});
const encoded = new Readable({ read: () => { encoded.push("decoded"); encoded.push(null); } });
encoded.setEncoding("utf8");
encoded.on("data", (chunk: unknown) => describeBuffer(chunk));
