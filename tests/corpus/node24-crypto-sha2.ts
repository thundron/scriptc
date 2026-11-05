import { createHash, createHmac, hash, pbkdf2Sync } from "node:crypto";

for (const algorithm of ["sha224", "sha384", "sha512"]) {
  for (const length of [0, 1, 55, 56, 63, 64, 65, 111, 112, 127, 128, 129, 255, 256, 1024]) {
    const input = "a".repeat(length);
    console.log("hash", algorithm, length, hash(algorithm, input));
    const digest = createHash(algorithm).update(input.slice(0, 37));
    const copy = digest.copy();
    digest.update(input.slice(37));
    copy.update(input.slice(37));
    console.log("chunks", digest.digest("hex"), copy.digest().toString("base64"));
  }
  for (const keyLength of [0, 63, 64, 65, 127, 128, 129, 257]) {
    console.log("hmac", algorithm, keyLength, createHmac(algorithm, "k".repeat(keyLength)).update("héllo ☃".repeat(20)).digest("hex"));
  }
  console.log("pbkdf2", algorithm, pbkdf2Sync("p".repeat(129), "salt", 3, 83, algorithm).toString("hex"));
}
