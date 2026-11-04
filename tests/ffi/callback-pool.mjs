import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
const ffi=req('node:ffi');
const a=ffi.dlopen(process.env.FFI_LIBRARY,{invoke:{arguments:['pointer','u64'],return:'u64'}});
const b=ffi.dlopen(process.env.FFI_LIBRARY,{});
const signature={arguments:['u64'],return:'u64'};
const x=a.lib.registerCallback(signature,v=>v+1n);
const y=b.lib.registerCallback(signature,v=>v+2n);
console.log(x!==y,a.functions.invoke(x,9007199254740993n),a.functions.invoke(y,9007199254740993n));
if (process.env.FFI_STATIC === '1') {
  try {a.lib.registerCallback(signature,v=>v);}catch {console.log('capacity');}
}
a.lib.unregisterCallback(x);
const z=a.lib.registerCallback(signature,v=>v+3n);
console.log(a.functions.invoke(z,42n));
a.lib.close();
b.lib.close();
const c=ffi.dlopen(process.env.FFI_LIBRARY,{invoke:{arguments:['pointer','u64'],return:'u64'}});
// Node aborts on a thrown native callback. scriptc defers the exception
// to the calling script frame; exercise that contract only in its lane.
if (process.env.FFI_STATIC === '1') {
  const error=c.lib.registerCallback(signature,()=>{throw new Error('callback failed');});
  try {c.functions.invoke(error,1n);} catch(e) {console.log(e.message);}
  c.lib.unregisterCallback(error);
  const overflow=c.lib.registerCallback(signature,()=>18446744073709551616n);
  try {c.functions.invoke(overflow,1n);} catch(e) {console.log(e.code);}
  c.lib.unregisterCallback(overflow);
}
const self=c.lib.registerCallback(signature,v=>{
  // Node frees executing callback code on close; scriptc pins its static
  // adapter's closure until invocation returns.
  if (process.env.FFI_STATIC === '1') c.lib.close();
  return v+4n;
});
console.log(c.functions.invoke(self,2n));
if (process.env.FFI_STATIC !== '1') c.lib.close();
