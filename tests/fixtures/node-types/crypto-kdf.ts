import { createHmac, hkdf, hkdfSync, scrypt, scryptSync } from "node:crypto";
import type { ScryptOptions } from "node:crypto";

const options: ScryptOptions = { N: 16, r: 1, p: 1, maxmem: 2432 };
console.log("scrypt", scryptSync("p", "s", 17, options).toString("hex"));
console.log("hkdf", Buffer.from(hkdfSync("sha512", "key", "salt", "info", 65)).toString("hex"));
console.log("hmac", createHmac("sha384", "key").update("data").digest("hex"));
hkdf("sha256", "key", "salt", "info", 33, (error, derived) => {
  console.log("hkdf-cb", error === null, derived instanceof ArrayBuffer, Buffer.from(derived).toString("hex"));
  scrypt("p", "s", 17, options, (err, bytes) => console.log("scrypt-cb", err === null, bytes.toString("hex")));
});
