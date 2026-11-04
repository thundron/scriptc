const stored = process.versions;
console.log(typeof stored, stored !== null, stored === process.versions);
console.log(typeof stored.node, typeof stored.openssl);
console.log(stored.node === process.versions.node, stored.openssl === process.versions.openssl);
console.log(stored.bun === undefined, stored.electron === undefined, stored.deno === undefined);
console.log(typeof process.versions === "object" &&
  process.versions !== null && typeof process.versions.bun === "string");
const descriptor = Object.getOwnPropertyDescriptor(stored, "node")!;
console.log(descriptor.enumerable, descriptor.configurable, descriptor.writable);
Object.defineProperty(stored, "node", { value: "native-probe" });
console.log(stored.node, process.versions.node);
Object.defineProperty(stored, "bun", { value: "probe", configurable: true });
Object.defineProperty(stored, "electron", { value: "probe", configurable: true });
console.log(stored.bun, process.versions.bun, process.versions?.electron);
