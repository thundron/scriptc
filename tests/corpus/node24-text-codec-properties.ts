import { TextDecoder as NodeDecoder } from "node:util";

for (const label of ["utf8", " \tUTF-8\r\n", "latin1", "cp866", "utf-16", "unicodefffe", "logical", "iso-8859-8-i", "visual", "gb18030", "gbk", "shift-jis", "euc-kr"]) {
  const decoder = new NodeDecoder(label, { fatal: true, ignoreBOM: true });
  console.log(JSON.stringify(label), decoder.encoding, decoder.fatal, decoder.ignoreBOM);
  console.log(decoder.decode(new Uint8Array()), decoder.encoding);
}

const decoder = new TextDecoder();
const readProperties = () => [decoder.encoding, decoder.fatal, decoder.ignoreBOM];
console.log(JSON.stringify(readProperties()));
const utf16 = new TextDecoder("utf-16le", { ignoreBOM: true });
console.log(utf16.encoding, utf16.decode(new Uint8Array([0xff, 0xfe, 0x61, 0])));

let calls = 0;
function label(): string { calls++; return "gbk"; }
console.log(new TextDecoder(label()).encoding, calls);
function receiver(): TextDecoder { calls++; return decoder; }
console.log(receiver().fatal, receiver().ignoreBOM, receiver().encoding, calls);

for (const label of ["logical", "visual"]) {
  const decoder = new TextDecoder(label);
  console.log(decoder.encoding, decoder.decode(new Uint8Array([0xe0]), { stream: true }), decoder.decode(), decoder.encoding);
}
