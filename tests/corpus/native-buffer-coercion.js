// Stream callbacks deliver Buffer-flavored checked values. Their implicit
// conversions use UTF-8 even though no encoding argument reaches the runtime.
import { Readable } from "node:stream";

function wrap(fn) {
  return function () { return fn.apply(this, arguments); };
}

function show(value) {
  console.log(JSON.stringify(String(value)));
  console.log(JSON.stringify("prefix:" + value));
  console.log(Number(value));
  console.log(JSON.stringify(value.toString("hex")));
  const nested = JSON.parse("[null]");
  nested.push(value);
  console.log(JSON.stringify(String(nested)));
}

let sent = false;
const stream = new Readable({
  read() {
    if (sent) return;
    sent = true;
    this.push(Buffer.from("42"));
    this.push(Buffer.from("héllo\0world"));
    this.push(Buffer.from([0xc3, 0x28]));
    this.push(null);
  },
});
stream.on("data", wrap(show));
