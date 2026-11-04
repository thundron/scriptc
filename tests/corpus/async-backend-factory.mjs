const source = {
  /** @param {Uint8Array} value */
  ptr(value) { return value.byteLength; },
  /** @param {number} pointer @param {number} offset @param {number} length */
  toArrayBuffer(pointer, offset, length) { return new ArrayBuffer(length); },
};
function createBackend(ffi) {
  return {
    ptr: ffi.ptr,
    toArrayBuffer(pointer, offset, length) {
      return ffi.toArrayBuffer(pointer, offset, length);
    },
  };
}
async function loadBackend() {
  return createBackend(await loadSource());
}
async function loadSource() { return source; }
const backend = await loadBackend();
console.log(backend.ptr(new Uint8Array(4)), backend.toArrayBuffer(0, 0, 8).byteLength);
console.log(await loadSource() === source);
const load = loadBackend;
console.log((await load()).ptr(new Uint8Array(4)));
