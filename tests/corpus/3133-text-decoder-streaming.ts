const decoder = new TextDecoder();
const alias = decoder;
console.log(JSON.stringify(decoder.decode(Uint8Array.from([0xef]), { stream: true })));
console.log(JSON.stringify(alias.decode(Uint8Array.from([0xbb, 0xbf, 0xf0, 0x9f]), { stream: true })));
console.log(JSON.stringify(decoder.decode(Uint8Array.from([0x98, 0x80, 0xef, 0xbb, 0xbf]), { stream: true })));
console.log(JSON.stringify(alias.decode()));
console.log(JSON.stringify(decoder.decode(Uint8Array.from([0xef, 0xbb, 0xbf, 65]))));
console.log(JSON.stringify(decoder.decode(Uint8Array.from([0xe0, 0x80]), { stream: true })));
console.log(JSON.stringify(decoder.decode()));
console.log(JSON.stringify(decoder.decode(Uint8Array.from([0xe2, 0x82]), { stream: true })));
console.log(JSON.stringify(decoder.decode()));

for (const label of ["utf-16le", "utf-16be"]) {
  const unicode = new TextDecoder(label);
  const bytes = label === "utf-16le" ? [0xff, 0xfe, 0x3d, 0xd8, 0x00, 0xde] : [0xfe, 0xff, 0xd8, 0x3d, 0xde, 0x00];
  let value = "";
  for (const byte of bytes) value += unicode.decode(Uint8Array.from([byte]), { stream: true });
  value += unicode.decode();
  console.log(label, JSON.stringify(value));
}

const latin = new TextDecoder("windows-1252");
console.log(JSON.stringify(latin.decode(Uint8Array.from([0x80]), { stream: true }) + latin.decode(Uint8Array.from([0xe9]))));
const preserving = new TextDecoder("utf8", { ignoreBOM: true });
console.log(JSON.stringify(preserving.decode(Uint8Array.from([0xef, 0xbb]), { stream: true }) + preserving.decode(Uint8Array.from([0xbf]))));
const strict = new TextDecoder("utf8", { fatal: true });
console.log(JSON.stringify(strict.decode(Uint8Array.from([0xf0, 0x9f]), { stream: true })));
try { strict.decode(); } catch (error) { console.log((error as NodeJS.ErrnoException).code); }
console.log(JSON.stringify(strict.decode(Uint8Array.from([65]))));
