import { createRequire } from "node:module";
const requireModule = createRequire(import.meta.url);
const ffi = requireModule("node:ffi");
console.log(ffi === requireModule("node:ffi"));
const u64Arguments = ["u64"];
const definitions = {
  nativeU64: { arguments: u64Arguments, return: "u64" },
  nativePointer: { arguments: ["pointer"], return: "pointer" },
  nativeI64: { arguments: ["int64"], return: "int64" },
  nativeByte: { arguments: ["bool"], return: "uint8" },
  firstByte: { arguments: ["pointer"], return: "u8" },
};
const first = ffi.dlopen(process.env.FFI_LIBRARY, definitions);
const second = ffi.dlopen(process.env.FFI_LIBRARY, definitions);
const call = first.functions.nativeU64;
console.log(call(9007199254740993n));
const bytes = new Uint8Array([42, 7]);
console.log(first.functions.nativePointer(bytes.subarray(1)) === ffi.getRawPointer(bytes) + 1n);
console.log(first.functions.nativePointer(null), first.functions.nativePointer(undefined));
console.log(first.functions.firstByte("A"), first.functions.nativeByte(255));
console.log(first.functions.nativeI64(-9223372036854775808n), call(18446744073709551615n));
for (const value of [-1n, 18446744073709551616n, 42]) {
  try { call(value); } catch (error) { console.log(error.name, error.code); }
}
for (const value of [-1, 256, 0.5, NaN, Infinity, true]) {
  try { first.functions.nativeByte(value); } catch (error) { console.log(error.name, error.code); }
}
for (const value of [-9223372036854775809n, 9223372036854775808n]) {
  try { first.functions.nativeI64(value); } catch (error) { console.log(error.name, error.code); }
}
try { first.functions.firstByte("A\0B"); } catch (error) { console.log(error.name, error.code); }
function nativeU64(value) { return value + 1; }
console.log(nativeU64(4));
for (const args of [[], [1n, 2n]]) {
  try { Reflect.apply(call, undefined, args); } catch { console.log("arity"); }
}
for (const defs of [{ missing: { arguments: [], return: "void" } }]) {
  try { ffi.dlopen(process.env.FFI_LIBRARY, defs); } catch { console.log("signature"); }
}
first.lib.close();
first.lib.close();
try { call(0n); } catch { console.log("closed"); }
console.log(second.functions.nativeU64(42n));
second.lib.close();
if (process.env.FFI_STATIC === "1") {
  try { ffi.dlopen(process.env.FFI_LIBRARY, { nativeU64: { arguments: ["i64"], return: "u64" } }); }
  catch { console.log("signature mismatch"); }
  u64Arguments[0] = "i64";
  try { ffi.dlopen(process.env.FFI_LIBRARY, definitions); }
  catch { console.log("mutated signature"); }
  try { ffi.dlopen(process.env.FFI_LIBRARY, { nativeU64: { return: "u64" } }); }
  catch (error) { console.log("missing arguments", error.name, error.code); }
}
