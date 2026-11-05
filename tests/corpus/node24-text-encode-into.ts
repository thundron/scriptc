import { TextEncoder as NodeEncoder } from "node:util";

const encoder = new NodeEncoder();
const sources = ["", "ASCII", "café", "€", "😀", "A😀é€Z", "\ud800x\udc00", "\0a"];
for (let index = 0; index < sources.length; index++) {
  const source = sources[index]!;
  for (let capacity = 0; capacity <= 16; capacity++) {
    const backing = new Uint8Array(capacity + 4).fill(0x55);
    const destination = backing.subarray(2, capacity + 2);
    const result = encoder.encodeInto(source, destination);
    console.log(index, capacity, JSON.stringify(result), Buffer.from(backing).toString("hex"));
  }
}

const buffer = Buffer.alloc(12, 0x33);
console.log(JSON.stringify(new TextEncoder().encodeInto("😀A", buffer.subarray(3, 8))), buffer.toString("hex"));

class CodecOwner {
  encoder: TextEncoder = new TextEncoder();
  write(source: string, destination: Uint8Array): string {
    return JSON.stringify(this.encoder.encodeInto(source, destination));
  }
}
const owner = new CodecOwner();
const destination = new Uint8Array(8);
console.log(owner.write("café", destination), owner.encoder.encoding, Buffer.from(destination).toString("hex"));
const captured = (source: string) => encoder.encodeInto(source, destination);
console.log(JSON.stringify(captured("abc")), encoder.encoding);

let order = "";
function receiver(): TextEncoder { order += "receiver;"; return encoder; }
function input(): string { order += "source;"; return "é"; }
function output(): Uint8Array { order += "dest;"; return destination; }
console.log(JSON.stringify(receiver().encodeInto(input(), output())), order);

for (const source of [undefined, null, 1, true, {}]) {
  try { encoder.encodeInto(source as string, destination); }
  catch (error) { if (error instanceof Error) console.log(error.name, (error as NodeJS.ErrnoException).code, error.message); }
}
for (const target of [undefined, null, 1, {}, new Uint16Array(2), new Uint8ClampedArray(4)]) {
  try { encoder.encodeInto("x", target as Uint8Array); }
  catch (error) { if (error instanceof Error) console.log(error.name, (error as NodeJS.ErrnoException).code, error.message); }
}
