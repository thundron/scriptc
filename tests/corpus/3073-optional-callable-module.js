console.log(early());
var getLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength")?.get;
function early() { return getLength === undefined; }
function isBuffer(value) {
  if (value === null || typeof value !== "object" || getLength == null) return false;
  try { getLength.call(value); return true; } catch { return false; }
}
console.log(early(), isBuffer(new ArrayBuffer(4)), isBuffer(JSON.parse('{}')));
getLength = undefined;
console.log(early(), isBuffer(new ArrayBuffer(4)));
