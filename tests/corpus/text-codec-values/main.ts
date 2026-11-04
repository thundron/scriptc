import { sharedEncoder, decodeShared } from "./shared.ts";
import { TextEncoder as UserEncoder } from "./user.ts";

class CodecOwner {
  readonly encoder: TextEncoder = new TextEncoder();
  readonly decoder: TextDecoder = new TextDecoder();
  roundTrip(text: string): string {
    return this.decoder.decode(this.encoder.encode(text));
  }
}

function decodeWith(decoder: TextDecoder, bytes: Uint8Array): string {
  return decoder.decode(bytes);
}

function makeEncoder(): (text: string) => Uint8Array {
  const encoder = new TextEncoder();
  return (text: string) => encoder.encode(text);
}

const owner = new CodecOwner();
console.log(owner.roundTrip("café 🎉"));
console.log(decodeShared(sharedEncoder.encode("imported ✓")));
const encode = makeEncoder();
console.log(decodeWith(new TextDecoder(), encode("captured 😀")));
let decoder: TextDecoder = new TextDecoder("windows-1252");
console.log(decodeWith(decoder, new Uint8Array([0x80, 0x93, 0x41, 0x94])));
decoder = new TextDecoder();
console.log(decodeWith(decoder, new Uint8Array([0xef, 0xbb, 0xbf, 0x41, 0xff])));
console.log(decoder.decode().length, owner.encoder.encode().length);
console.log(new TextEncoder().encode().length);
const alias = owner.encoder;
console.log(alias === owner.encoder, alias === new TextEncoder());
const pair = [new TextDecoder("utf-16le"), new TextDecoder("windows-1252")];
console.log(pair[0]!.decode(new Uint8Array([0x61, 0, 0x62, 0])), pair[1]!.decode(new Uint8Array([0x80])));

let events = "";
function receiver(): TextDecoder { events += "receiver;"; return decoder; }
function input(): Uint8Array { events += "input;"; return new Uint8Array([0x41]); }
console.log(receiver().decode(input()), events);
events = "";
function label(): "utf-8" { events += "label;"; return "utf-8"; }
const labelled = new TextDecoder(label());
console.log(labelled.decode(input()), labelled.decode(), events);

// User types with codec-like names retain their own implementation.
console.log(new UserEncoder().encode("hello"));

function earlyCapture(early: boolean): string {
  const use = () => encoder.encode("x");
  if (early) {
    try { return String(use().length); }
    catch (error) { return error instanceof Error ? error.name + ":" + error.message : "wrong error"; }
  }
  const encoder = new TextEncoder();
  return String(use().length);
}
console.log(earlyCapture(true), earlyCapture(false));

function globalRead(): number { return laterEncoder.encode("early").length; }
try { console.log(globalRead()); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
const laterEncoder = new TextEncoder();
console.log(globalRead());

let writes = 0;
function value(): TextDecoder { writes++; return new TextDecoder("windows-1252"); }
function globalWrite(): void { laterDecoder = value(); }
function globalWriteExpression(): TextDecoder { return laterDecoder = value(); }
try { globalWrite(); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message, writes); }
try { globalWriteExpression(); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message, writes); }
let laterDecoder = new TextDecoder();
console.log(globalWriteExpression().decode(new Uint8Array([0x80])), writes);
