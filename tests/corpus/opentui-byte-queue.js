// The input-parser queue compacts overlapping views and grows by copying.
class ByteQueue {
  buf;
  start = 0;
  end = 0;
  constructor(capacity = 8) { this.buf = new Uint8Array(capacity); }
  get length() { return this.end - this.start; }
  view() { return this.buf.subarray(this.start, this.end); }
  /** @param {any} chunk */
  append(chunk) {
    if (chunk.length === 0) return;
    this.ensureCapacity(this.length + chunk.length);
    this.buf.set(chunk, this.end);
    this.end += chunk.length;
  }
  consume(count) {
    this.start += count;
    if (this.start >= this.end) { this.start = 0; this.end = 0; return; }
    if (this.start >= this.buf.length / 2) {
      this.buf.copyWithin(0, this.start, this.end);
      this.end -= this.start;
      this.start = 0;
    }
  }
  ensureCapacity(required) {
    if (this.buf.length - this.start >= required) return;
    if (this.buf.length >= required) {
      this.buf.copyWithin(0, this.start, this.end);
      this.end -= this.start;
      this.start = 0;
      return;
    }
    const next = new Uint8Array(Math.max(required, this.buf.length * 2));
    next.set(this.view());
    this.end -= this.start;
    this.start = 0;
    this.buf = next;
  }
}
class Parser {
  queue = new ByteQueue();
  paste = null;
  constructor() { this.paste = { parts: [], totalLength: 0 }; }
  /** @param {any} bytes */
  push(bytes) {
    this.queue.append(bytes);
    this.paste.parts.push(Uint8Array.from(bytes));
    this.paste.totalLength += bytes.length;
  }
}
const parser = new Parser();
parser.push(new Uint8Array([1, 2, 3, 4, 5, 6]));
parser.queue.consume(4);
parser.push(new Uint8Array([7, 8, 9, 10, 11]));
parser.queue.consume(2);
parser.push(new Uint8Array([12, 13, 14]));
parser.push(new Uint8Array([15, 16, 17, 18]));
console.log(Buffer.from(parser.queue.view()).toString("hex"), parser.queue.length, parser.paste.totalLength);
console.log(parser.paste.parts.length, Buffer.from(parser.paste.parts[0]).toString("hex"));
parser.queue.consume(parser.queue.length);
console.log(parser.queue.start, parser.queue.end, parser.queue.length);

/** @type {any} */
let state = { nested: { count: 2 } };
const old = state.nested;
function replacement() { state = { nested: { count: 100 } }; return 3; }
state.nested.count += replacement();
console.log(old.count, state.nested.count);
