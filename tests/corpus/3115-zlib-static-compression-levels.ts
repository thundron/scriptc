import { deflateSync, deflateRawSync, gzipSync, inflateSync, inflateRawSync, gunzipSync } from "node:zlib";
const text = "native emitter π\u0000".repeat(400);
const data = Buffer.from(text, "utf8");
const raw = [
  deflateRawSync(data, { level: -1 }),
  deflateRawSync(data, { level: 0 }),
  deflateRawSync(data, { level: 1 }),
  deflateRawSync(data, { level: 2 }),
  deflateRawSync(data, { level: 3 }),
  deflateRawSync(data, { level: 4 }),
  deflateRawSync(data, { level: 5 }),
  deflateRawSync(data, { level: 6 }),
  deflateRawSync(data, { level: 7 }),
  deflateRawSync(data, { level: 8 }),
  deflateRawSync(data, { level: 9 }),
];
for (let i = 0; i < raw.length; i++) {
  const bytes = raw[i]!;
  console.log(inflateRawSync(bytes).equals(data));
}
// Encoded bytes vary by zlib version. Pin level zero's uncompressed size
// and level nine's compression without requiring a particular bitstream.
console.log(raw[1]!.length > data.length, raw[10]!.length < data.length / 10);
const zlib = deflateSync(data, { level: 9 });
console.log(inflateSync(zlib).equals(data));
const gzip = gzipSync(data, { level: 9 });
console.log(gunzipSync(gzip).equals(data));
console.log(inflateRawSync(deflateRawSync("", { level: 9 })).length);
console.log(inflateSync(deflateSync("hello", { level: 0 })).toString());
console.log(gunzipSync(gzipSync("hello", { level: 1 })).toString());
let calls = 0;
function input(): Buffer { calls++; return data; }
console.log(inflateRawSync(deflateRawSync(input(), { level: 9 })).equals(data), calls);
