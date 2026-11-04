const { pbkdf2, randomBytes } = require("node:crypto");
const { deflate, inflate } = require("node:zlib");
async function main() {
  await new Promise(resolve => pbkdf2("password", "salt", 2, 8, "sha256", (error, value) => {
    console.log(error === null, Buffer.isBuffer(value), value.toString("hex"));
    resolve(undefined);
  }));
  await new Promise(resolve => randomBytes(4, (error, value) => {
    console.log(error === null, Buffer.isBuffer(value), value.toString("hex").length);
    resolve(undefined);
  }));
  await new Promise(resolve => deflate("hello", (error, compressed) => {
    console.log(error === null, Buffer.isBuffer(compressed));
    inflate(compressed, (failure, value) => {
      console.log(failure === null, Buffer.isBuffer(value), value.toString("utf8"), value.toString("hex"));
      resolve(undefined);
    });
  }));
}
main();
