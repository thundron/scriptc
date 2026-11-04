import { hkdf, hkdfSync, scrypt, scryptSync } from "node:crypto";

for (const algorithm of ["md5", "sha1", "sha224", "sha256", "sha384", "sha512"]) {
  const key = hkdfSync(algorithm, "secret", "salt", "context", 83);
  console.log("hkdf", algorithm, key instanceof ArrayBuffer, Buffer.from(key).toString("hex"));
  console.log("empty", algorithm, Buffer.from(hkdfSync(algorithm, "", "", "", 17)).toString("hex"));
}
const rfcIkm = Buffer.alloc(22, 11);
console.log("rfc5869", Buffer.from(hkdfSync("sha256", rfcIkm, Buffer.from("000102030405060708090a0b0c", "hex"), Buffer.from("f0f1f2f3f4f5f6f7f8f9", "hex"), 42)).toString("hex"));
console.log("hkdf-info-limit", Buffer.from(hkdfSync("SHA512", "héllo ☃", "salt", "x".repeat(1024), 65)).toString("hex"));
console.log("hkdf-max", Buffer.from(hkdfSync("sha256", "key", "salt", "info", 8160)).subarray(8130).toString("hex"));
console.log("rfc7914", scryptSync("", "", 64, { N: 16, r: 1, p: 1 }).toString("hex"));
console.log("scrypt-default", scryptSync("password", "salt", 32).toString("hex"));
console.log("scrypt-parallel", scryptSync("password", "NaCl", 64, { N: 1024, r: 8, p: 16 }).toString("hex"));
console.log("scrypt-aliases", scryptSync("päss ☃", "salt", 33, { cost: 32, blockSize: 2, parallelization: 3, maxmem: 65536 }).toString("hex"));
console.log("scrypt-zero", scryptSync("p", "s", 0).length, scryptSync("p", "s", 1, { N: 0, r: 0, p: 0, maxmem: 0 }).toString("hex"));
console.log("scrypt-memory-boundary", scryptSync("p", "s", 17, { N: 16, r: 1, p: 1, maxmem: 2432 }).toString("hex"));

const storage = new ArrayBuffer(16);
const bytes = new Uint8Array(storage);
bytes.set([0, 1, 2, 3, 4, 5, 6, 7]);
const words = new Uint16Array(storage, 2, 2);
const view = new DataView(storage, 4, 3);
console.log("hkdf-views", Buffer.from(hkdfSync("sha384", words, view, storage, 49)).toString("hex"));
console.log("scrypt-views", scryptSync(words, view, 17, { N: 16, r: 1 }).toString("hex"));
console.log("unchanged", Buffer.from(storage).toString("hex"));

let sync = true;
hkdf("sha512", "key", "salt", "info", 65, (error, key) => {
  console.log("hkdf-callback", sync, error === null, key instanceof ArrayBuffer, Buffer.from(key).toString("hex"));
  scrypt("password", "salt", 17, { N: 16, r: 2 }, (err, derived) => {
    console.log("scrypt-callback", err === null, derived.toString("hex"));
    scrypt("p", "s", 0, (lastError, empty) => console.log("scrypt-default-callback", lastError === null, empty.length));
  });
});
queueMicrotask(() => console.log("microtask-before-callback"));
sync = false;
