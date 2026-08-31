import { TextDecoder as UtilTextDecoder } from "node:util";

const fatal = new UtilTextDecoder("utf-8", { fatal: true });
console.log(fatal.decode(new Uint8Array([0x63, 0x61, 0x66, 0xc3, 0xa9])));
console.log(JSON.stringify(fatal.decode(new Uint8Array([0xef, 0xbb, 0xbf, 0x41]))));
console.log(new UtilTextDecoder("UTF8", { fatal: true }).decode(new Uint8Array([0xf0, 0x9f, 0x98, 0x80])));

const invalid: Uint8Array[] = [
  new Uint8Array([0xff]),
  new Uint8Array([0xc0, 0x80]),
  new Uint8Array([0xe2, 0x82]),
  new Uint8Array([0xe2, 0x28, 0xa1]),
  new Uint8Array([0xed, 0xa0, 0x80]),
  new Uint8Array([0xf4, 0x90, 0x80, 0x80]),
];
for (const bytes of invalid) {
  try {
    fatal.decode(bytes);
    console.log("missed");
  } catch (error) {
    const e = error as Error;
    console.log(e.name + ": " + e.message);
  }
}

console.log(new TextDecoder().decode(new Uint8Array([0xff])));
