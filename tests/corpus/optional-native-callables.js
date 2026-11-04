const getLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength")?.get;
const buffer = new ArrayBuffer(12);
if (getLength) console.log(typeof getLength, getLength.call(buffer));
const empty = /** @type {unknown} */ ({});
const none = Object.getOwnPropertyDescriptor(empty, "missing")?.get;
console.log(none === undefined);
