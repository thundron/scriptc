import { createHash as makeHash } from "node:crypto";

const sha256 = makeHash("sha256");
sha256.update("alpha");
sha256.update(new Uint8Array([0, 255, 16]));
sha256.update("omega");
console.log(sha256.digest("hex"));

const sha1 = makeHash("sha1");
console.log(sha1.update("a").update("bc").digest("base64"));

const finalized = makeHash("sha256");
finalized.update("done");
console.log(finalized.digest("hex"));
try {
  finalized.update("again");
} catch (error) {
  console.log(error instanceof Error ? error.message : "wrong error");
}
try {
  finalized.digest("hex");
} catch (error) {
  console.log(error instanceof Error ? error.message : "wrong error");
}
