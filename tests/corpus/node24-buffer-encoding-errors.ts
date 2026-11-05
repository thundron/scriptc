import { isAscii, isUtf8, transcode } from "node:buffer";

for (const input of [undefined, null, 1, "x", {}, [], new DataView(new ArrayBuffer(2))]) {
  try { console.log(isAscii(input as Uint8Array)); }
  catch (error) { if (error instanceof Error) console.log(error.name, (error as NodeJS.ErrnoException).code, error.message); }
  try { console.log(isUtf8(input as Uint8Array)); }
  catch (error) { if (error instanceof Error) console.log(error.name, (error as NodeJS.ErrnoException).code, error.message); }
  try { console.log(transcode(input as Uint8Array, "utf8", "ascii")); }
  catch (error) { if (error instanceof Error) console.log(error.name, (error as NodeJS.ErrnoException).code, error.message); }
}
for (const encoding of [undefined, null, "", "bad", "hex", "base64", 1, {}]) {
  try { console.log(transcode(Buffer.from("abc"), encoding as string, "utf8").toString("hex")); }
  catch (error) { if (error instanceof Error) console.log(error.name, (error as NodeJS.ErrnoException).code, error.message); }
  try { console.log(transcode(Buffer.from("abc"), "utf8", encoding as string).toString("hex")); }
  catch (error) { if (error instanceof Error) console.log(error.name, (error as NodeJS.ErrnoException).code, error.message); }
}
console.log(transcode(Buffer.alloc(0), "bad", "hex").length);
