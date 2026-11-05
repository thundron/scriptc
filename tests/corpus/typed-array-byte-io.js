import { PassThrough } from "node:stream";

async function check(value) {
  console.log(Buffer.from(value).toString("hex"));
  const stream = new PassThrough();
  stream.on("data", chunk => console.log(chunk.toString("hex")));
  stream.end(value);
  const response = new Response(value);
  const body = new Uint8Array(await response.arrayBuffer());
  console.log(body.join(","));
  try { Buffer.compare(Buffer.from([1]), value); } catch (e) { console.log(e.name, e.message); }
}
const buffer = new ArrayBuffer(8);
const raw = new Uint8Array(buffer);
raw.set([1, 2, 3, 4, 5, 6, 7, 8]);
await check(new Uint16Array(buffer, 2, 2));
await check(new Int16Array([-1, -32768]));
await check(new Float32Array([1.5, -2]));
