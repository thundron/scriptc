const input = process.stdin;
const output = process.stdout;
const error = process.stderr;
console.log(input === process.stdin, output === process.stdout, error === process.stderr);
console.log(input === output, output === error, input.fd, output.fd, error.fd);
console.log(Boolean(input.isTTY), Boolean(output.isTTY), output.columns ?? 80, output.rows ?? 24);
console.log(typeof input.setRawMode, typeof input.on, input.readableLength);
console.log(input.pause() === input, input.isPaused());
console.log(input.resume() === input, input.isPaused());
input.pause();
let calls = 0;
const original = output.write;
output.write = function(chunk, encoding, callback) {
  calls++;
  return original.call(this, chunk, encoding, callback);
};
output.write(Buffer.from('bytes\n'), () => {
  output.write = original;
  console.log('completed', calls, output.write === original);
});
console.log('through-console');
