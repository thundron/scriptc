import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const ffi = require('node:ffi');
const bytes = new Uint8Array([10,20,30,40]);
const pointer = ffi.getRawPointer(bytes.buffer);
console.log(typeof pointer, pointer !== 0n);
const alias = new Uint8Array(ffi.toArrayBuffer(pointer + 1n, 2, false));
alias[0] = 99;
console.log(bytes.join(','), alias.join(','));
const copied = new Uint8Array(ffi.toArrayBuffer(pointer, 4));
bytes[0] = 55;
console.log(copied.join(','), bytes.join(','));
const offset = bytes.subarray(2);
console.log(ffi.getRawPointer(offset) === pointer + 2n);
for (let i=0;i<1000;i++) {
 const view = new Uint8Array(ffi.toArrayBuffer(pointer, 4, false));
 view[3] = i % 256;
}
console.log(bytes[3]);
console.log(new Uint8Array(ffi.toArrayBuffer(0n,0,false)).length);
for (const [address, length] of [[-1n,0],[1n<<65n,0],[0n,1],[0n,-1],[0n,0.5],[(1n<<64n)-1n,2],[0n,Number.MAX_VALUE],[1n,2**54]]) {
  try { ffi.toArrayBuffer(address,length,false); } catch(error) { console.log(error.name,error.code,error.message); }
}
for (const copy of [false, 0, '', null, true, 'copy']) {
  const view = new Uint8Array(ffi.toArrayBuffer(pointer,1,copy));
  const before = bytes[0];
  view[0] = before + 1;
  console.log(bytes[0] === view[0]);
}
