import { isAscii, isUtf8, transcode } from "node:buffer";
import { TextEncoder, TextDecoder } from "node:util";

const destination = Buffer.alloc(8, 0x55);
const encoder = new TextEncoder();
const result = encoder.encodeInto("😀é", destination);
console.log(result.read, result.written, encoder.encoding, destination.toString("hex"));
const decoder = new TextDecoder("gbk", { fatal: true, ignoreBOM: true });
console.log(decoder.encoding, decoder.fatal, decoder.ignoreBOM);
console.log(isAscii(destination), isUtf8(destination), isUtf8(new Uint16Array([0x41])));
const converted = transcode(Buffer.from("café"), "utf8", "latin1");
console.log(converted.toString("hex"), Buffer.isBuffer(converted));
