const metadata = new WeakMap<ArrayBuffer, string>();
const view = new Float32Array(3);
const buffer = view.buffer;
metadata.set(buffer, "root");
console.log(metadata.get(view.subarray(1).buffer), metadata.has(new ArrayBuffer(12)));
console.log(metadata.delete(buffer), metadata.has(buffer));
const seeded = new WeakMap<ArrayBuffer, string>([[buffer, "seed"]]);
console.log(seeded.get(buffer));
