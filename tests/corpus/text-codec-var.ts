function encode(): Uint8Array { return encoder.encode(input()); }
let calls = 0;
function input(): string { calls++; return "café"; }
function encoderState(): void { console.log(encoder === undefined, typeof encoder); }
encoderState();
try { encode(); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message, calls); }
var encoder = new TextEncoder();
console.log(encode().join(","), calls);
const saved = encoder;
encoder = new TextEncoder();
console.log(saved === encoder, saved.encode("saved").length);
function decode(): string { return decoder.decode(new Uint8Array([0x80])); }
try { decode(); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
var decoder: TextDecoder;
function decoderState(): void { console.log(decoder === undefined); }
decoderState();
decoder = new TextDecoder("windows-1252");
console.log(decode());
decoder = new TextDecoder();
console.log(decoder.decode(encoder.encode("shared ✓")));
function nestedRead(): number { return nested.encode("nested").length; }
try { nestedRead(); }
catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
if (calls > 0) { var nested = new TextEncoder(); }
console.log(nestedRead());
