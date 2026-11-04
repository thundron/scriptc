import { commentText, llvmBytes, llvmQuoted, octalByte, unsignedHex } from "../../../packages/compiler/src/backend/literals.js";
import { f64Lit, ffiNativeTypeLl, llvmCommentText } from "../../../packages/compiler/src/backend/llvm/common.js";
import { mangleClassNew, mangleClassObj, mangleClassRelease, mangleClassRetain, mangleClassStruct, mangleField, mangleFunction, mangleGlobal, mangleLocal, mangleRecordStruct, mangleVtInstance } from "../../../packages/compiler/src/backend/mangle.js";
import { BOOL, F64, STRING, VOID, arrayOf, funcOf, mapOf, type IrType } from "../../../packages/compiler/src/ir/ir.js";

const bytes = new Uint8Array(256);
for (let i = 0; i < bytes.length; i++) bytes[i] = i;
console.log(llvmBytes(bytes));
console.log(llvmBytes(bytes, false));
console.log(llvmBytes(new Uint8Array()));

for (let i = 0; i < 256; i++) console.log(unsignedHex(i), octalByte(i));
for (const value of [0x100, 0xffff, 0x10000, 0x10ffff, 2 ** 32, 2 ** 48 - 1, Number.MAX_SAFE_INTEGER]) {
  console.log(unsignedHex(value));
}
for (const value of [-1, 0.5, NaN, Infinity]) {
  try { console.log(unsignedHex(value)); }
  catch (error) { if (error instanceof Error) console.log(error.name + ": " + error.message); }
}

for (const value of [0, -0, 1, -1, 0.1, Number.MIN_VALUE, Number.MAX_VALUE, Infinity, -Infinity, NaN]) {
  console.log(f64Lit(value));
}

for (const text of ["", "ordinary", "é日本😀", 'quote"slash\\\0', "line\nnext\u2028last", "/* comment */"]) {
  console.log(llvmQuoted(text));
  console.log(JSON.stringify(commentText(text)));
  console.log(JSON.stringify(llvmCommentText(text)));
}

for (const name of ["ordinary", "x.12", "$x%y", "é日本", "😀", "nul\0", "dash-here", "a\nb"]) {
  console.log(mangleFunction(name), mangleLocal(name), mangleGlobal(name), mangleField(name));
  console.log(mangleClassStruct(name), mangleClassObj(name), mangleClassNew(name));
  console.log(mangleClassRetain(name), mangleClassRelease(name), mangleVtInstance(name), mangleRecordStruct(name));
}

console.log(ffiNativeTypeLl("f64"), ffiNativeTypeLl("bool"), ffiNativeTypeLl("u8"));
console.log(ffiNativeTypeLl("u32"), ffiNativeTypeLl("i32"), ffiNativeTypeLl("cstring"), ffiNativeTypeLl("void"));
try { console.log(ffiNativeTypeLl("bytes")); }
catch (error) { if (error instanceof Error) console.log(error.name + ": " + error.message); }
