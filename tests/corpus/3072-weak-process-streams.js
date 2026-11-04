const owners = new WeakMap();
const streams = new WeakSet();
for (const stream of [process.stdin, process.stdout, process.stderr]) {
  console.log(owners.get(stream) === undefined, streams.has(stream));
  owners.set(stream, stream.fd);
  streams.add(stream);
}
console.log(owners.get(process.stdin), owners.get(process.stdout), owners.get(process.stderr));
console.log(streams.has(process.stdin), owners.delete(process.stdout), owners.has(process.stdout));
