import { hkdf, hkdfSync, scrypt, scryptSync } from "node:crypto";

function caught(label: string, run: () => void): void {
  try { run(); console.log(label, "no-error"); }
  catch (error) {
    if (error instanceof Error) console.log(label, error.name, (error as NodeJS.ErrnoException).code, error.message);
  }
}
for (const length of [0, -1, 1.5, NaN, Infinity, 9007199254740992]) {
  caught("hkdf-length", () => { hkdfSync("sha256", "key", "salt", "", length); });
}
caught("hkdf-info", () => { hkdfSync("sha256", "key", "salt", "x".repeat(1025), 1); });
caught("hkdf-keylen", () => { hkdfSync("sha256", "key", "salt", "", 8161); });
const algorithm: string = "nope";
caught("hkdf-digest", () => { hkdfSync(algorithm, "key", "salt", "", 1); });
let called = false;
caught("hkdf-async-keylen", () => { hkdf("sha1", "key", "salt", "", 5101, () => { called = true; }); });
caught("hkdf-async-digest", () => { hkdf(algorithm, "key", "salt", "", 1, () => { called = true; }); });
console.log("invalid-callback-not-called", called);
for (const length of [-1, 1.5, NaN, 2147483648]) caught("scrypt-length", () => { scryptSync("p", "s", length); });
for (const cost of [-1, 1.5, NaN, 4294967296, 1, 3]) caught("scrypt-cost", () => { scryptSync("p", "s", 1, { N: cost }); });
caught("scrypt-alias-cost", () => { scryptSync("p", "s", 1, { cost: -1 }); });
caught("scrypt-conflict-N", () => { scryptSync("p", "s", 1, { N: 16, cost: 16 }); });
caught("scrypt-conflict-r", () => { scryptSync("p", "s", 1, { r: 1, blockSize: 1 }); });
caught("scrypt-conflict-p", () => { scryptSync("p", "s", 1, { p: 1, parallelization: 1 }); });
caught("scrypt-async-invalid", () => { scrypt("p", "s", 1, { N: 3 }, () => { called = true; }); });
caught("scrypt-maxmem-range", () => { scryptSync("p", "s", 1, { maxmem: -1 }); });
caught("scrypt-memory-limit", () => { scryptSync("p", "s", 1, { N: 16, r: 1, p: 1, maxmem: 2431 }); });
caught("scrypt-default-memory", () => { scryptSync("p", "s", 0, { N: 32768 }); });
console.log("invalid-callback-still-not-called", called);

hkdf("sha256", "", "", "", 0, (error, key) => {
  console.log("hkdf-zero-callback", error instanceof Error, error?.message, key === undefined);
});
