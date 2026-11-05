import { TextEncoder as UtilEncoder, TextDecoder as UtilDecoder } from "node:util";

class NativeTextBridge {
  readonly encoder: TextEncoder = new TextEncoder();
  readonly decoder: TextDecoder = new TextDecoder();
}

function decode(decoder: TextDecoder, data: Uint8Array): string {
  return decoder.decode(data);
}

const bridge = new NativeTextBridge();
console.log(decode(bridge.decoder, bridge.encoder.encode("typed café 🎉")));
const imported: TextDecoder = new UtilDecoder("windows-1252");
const encoder: TextEncoder = new UtilEncoder();
console.log(decode(imported, new Uint8Array([0x80])), encoder.encode("typed").length);
