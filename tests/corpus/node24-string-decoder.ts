import { StringDecoder } from "node:string_decoder";

const utf8 = new StringDecoder("utf8");
console.log("split", JSON.stringify(utf8.write(Buffer.from([0xe2]))), JSON.stringify(utf8.write(Buffer.from([0x82]))), JSON.stringify(utf8.end(Buffer.from([0xac]))));
console.log("reuse", JSON.stringify(utf8.end(Buffer.from("again"))), JSON.stringify(utf8.end()));
console.log("bom", JSON.stringify(utf8.write(Buffer.from([0xef]))), JSON.stringify(utf8.end(Buffer.from([0xbb, 0xbf, 0x61]))));
// @ts-expect-error Node accepts strings; its declarations only name Uint8Array.
console.log("string", JSON.stringify(utf8.write(Buffer.from([0xe2]))), JSON.stringify(utf8.write("middle")), JSON.stringify(utf8.end("last")));
console.log("undefined", JSON.stringify(utf8.write(Buffer.from([0xc3]))), JSON.stringify(utf8.end(undefined)), JSON.stringify(utf8.end()));
console.log("invalid", JSON.stringify(utf8.write(Buffer.from([0xe0]))), JSON.stringify(utf8.write(Buffer.from([0x80]))), JSON.stringify(utf8.end(Buffer.from([0x61]))));
console.log("view", JSON.stringify(utf8.end(new Uint8Array([0, 0x68, 0x69, 0]).subarray(1, 3))));
// @ts-expect-error Node accepts every ArrayBufferView, including Uint16Array.
console.log("wide", JSON.stringify(utf8.end(new Uint16Array([0x6968]))));
// @ts-expect-error Node accepts DataView input as raw bytes.
console.log("data-view", utf8.end(new DataView(new Uint8Array([0, 0x68, 0x69, 0]).buffer, 1, 2)));
const utf16 = new StringDecoder("utf16le");
console.log("utf16", JSON.stringify(utf16.write(Buffer.from([0x3d, 0xd8]))), JSON.stringify(utf16.write(Buffer.from([0x00]))), JSON.stringify(utf16.end(Buffer.from([0xde, 0x61, 0]))));
console.log("odd", JSON.stringify(utf16.write(Buffer.from([0x61]))), JSON.stringify(utf16.end(Buffer.from([0, 0x62]))), JSON.stringify(utf16.end(Buffer.from([0x63, 0]))));
const base64 = new StringDecoder("base64");
console.log("base64", JSON.stringify(base64.write(Buffer.from([1]))), JSON.stringify(base64.end(Buffer.from([2, 3, 4]))), JSON.stringify(base64.end(Buffer.from([5]))));
const url = new StringDecoder("base64url");
console.log("base64url", JSON.stringify(url.write(Buffer.from([251]))), JSON.stringify(url.end(Buffer.from([255, 254, 251]))));
const hex = new StringDecoder("hex");
// @ts-expect-error Node StringDecoder.write accepts string passthrough.
console.log("hex", hex.write("unchanged"), hex.end(Buffer.from([0xab, 0xcd])), hex.end());
let order = "";
function receiver(): StringDecoder { order += "r"; return utf8; }
function chunk(): Buffer { order += "c"; return Buffer.from([0x61]); }
console.log("order", receiver().end(chunk()), order);

function absent(): undefined { order += "u"; return undefined; }
console.log("undefined-order", receiver().end(absent()), order);
