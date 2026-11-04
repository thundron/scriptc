import { isAscii, isUtf8, transcode } from "node:buffer";

const samples = [
  [], [0, 0x41, 0x7f], [0x80], [0xc0, 0xaf], [0xc2, 0xa0], [0xe0, 0xa0, 0x80],
  [0xed, 0x9f, 0xbf], [0xed, 0xa0, 0x80], [0xf0, 0x90, 0x80, 0x80],
  [0xf4, 0x8f, 0xbf, 0xbf], [0xf4, 0x90, 0x80, 0x80], [0xf0, 0x9f],
  [0xe1, 0x80, 0x41], [0xef, 0xbb, 0xbf], [0x61, 0], [0, 0xd8],
  [0, 0xdc], [0, 0xd8, 0x61, 0], [0xff, 0xfe, 0x61, 0], [0x61, 0, 0xff],
];
for (const values of samples) {
  const input = Buffer.from(values);
  console.log(input.toString("hex"), isAscii(input), isUtf8(input));
  for (const from of ["ascii", "latin1", "utf8", "utf16le"]) {
    for (const to of ["ascii", "latin1", "utf8", "utf16le"]) {
      try {
        const result = transcode(input, from, to);
        console.log(from, to, result.toString("hex"), Buffer.isBuffer(result), result === input);
      } catch (error) {
        if (error instanceof Error) console.log(from, to, error.name, (error as NodeJS.ErrnoException).code, error.message);
      }
    }
  }
}

const backing = new Uint8Array([0xff, 0xc3, 0xa9, 0xff]);
const view = backing.subarray(1, 3);
console.log(isUtf8(view), isAscii(view), transcode(view, "UTF-8", "UCS-2").toString("hex"));
for (const input of [new Uint16Array([0x80]), new Int8Array([0x41]), new Uint8ClampedArray([0x7f])]) {
  console.log(isAscii(input), isUtf8(input));
}
console.log(isAscii(new ArrayBuffer(0)), isUtf8(new ArrayBuffer(0)));

for (const cp of [0xad, 0x34f, 0x61c, 0x115f, 0x17b4, 0x180b, 0x200b, 0x202a, 0x2060, 0x3164, 0xfe00, 0xfeff, 0xffa0, 0xfff0, 0x1bca0, 0x1d173, 0xe0000, 0xe0100, 0x1f600]) {
  const source = Buffer.from(String.fromCodePoint(cp));
  console.log(cp, transcode(source, "utf8", "ascii").toString("hex"), transcode(source, "utf8", "latin1").toString("hex"));
}
for (const alias of ["ascii", "ASCII", "latin1", "binary", "utf8", "utf-8", "utf16le", "utf-16le", "ucs2", "ucs-2"]) {
  console.log(alias, transcode(Buffer.from([0x61, 0]), alias, "binary").toString("hex"));
}
