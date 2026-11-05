async function* values() {
  try { yield 20; yield 22; }
  finally { console.log("closed"); }
}
function iterator(value: any) { return value[Symbol.asyncIterator](); }
async function run(value: any) {
  const stream = iterator(value);
  console.log(stream === value, typeof stream.next, typeof stream.return);
  console.log(JSON.stringify(await stream.next()));
  console.log(JSON.stringify(await stream.return()));
  console.log(JSON.stringify(await stream.next()));
}
run(values());
async function collect(value: any) {
  const stream = iterator(value);
  const next = async () => stream.next();
  console.log(JSON.stringify(await next()));
  console.log(JSON.stringify(await next()));
  console.log(JSON.stringify(await next()));
}
collect(values());
