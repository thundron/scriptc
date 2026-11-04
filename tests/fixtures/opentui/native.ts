declare function nativeCreate(): number;
declare function nativeDestroy(handle: number): void;
declare function nativeAppend(handle: number, text: string): void;
declare function nativeRead(handle: number, target: Uint8Array): number;
declare function nativeRender(text: string, target: Uint8Array): number;

const handle = nativeCreate();
if (handle === 0) throw new Error("OpenTUI text buffer creation failed");
// Temporary strings exercise the adapter's retained copies.
nativeAppend(handle, ["Hello", ", "].join(""));
nativeAppend(handle, ["scriptc!", " café 🎉"].join(""));
const output = new Uint8Array(128);
const written = nativeRead(handle, output.subarray(3));
console.log(new TextDecoder().decode(output.subarray(3, 3 + written)));
console.log(output[0], output[1], output[2]);
nativeDestroy(handle);
const frame = new Uint8Array(256);
const frameLength = nativeRender("Hello, static OpenTUI!", frame);
console.log(new TextDecoder().decode(frame.subarray(0, frameLength)).trim());
