// @dynamic
// @stderr
import { reportEncoding, encodeInto, transcode } from "node24-text-encoding-fixture/encoding.js";
reportEncoding();
const destination = new Uint8Array(8).fill(0x55);
console.log("boundary", JSON.stringify(encodeInto("😀é", destination)));
console.log("converted", transcode(Buffer.from("café"), "utf8", "latin1").toString("hex"));
