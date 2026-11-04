// fetch(url), RequestInit, AbortSignal, readable bodies, and the
// Response json/text/bytes/arrayBuffer readers are native static surface.
// Reading a body method as a value and constructing Headers remain fenced.
async function probe(url: string): Promise<number> {
  const r = await fetch(url);
  return r.status;
}
function inspect(r: Response): boolean {
  return r.ok;
}
const sig = AbortSignal.timeout(100);
async function timed(url: string): Promise<string> {
  const r = await fetch(url, { signal: AbortSignal.timeout(100) });
  return r.text();
}
probe("http://localhost/a");
timed("http://localhost/b");
async function arrayBufferBody(url: string): Promise<void> {
  await (await fetch(url)).arrayBuffer();
}
arrayBufferBody("http://localhost/c");
async function bracketArrayBufferBody(url: string): Promise<void> {
  await (await fetch(url))["arrayBuffer"]();
}
bracketArrayBufferBody("http://localhost/d");
async function bracketArrayBufferRead(url: string): Promise<void> {
  const unsupported = (await fetch(url))["arrayBuffer"];
}
bracketArrayBufferRead("http://localhost/e");
const headers = new Headers();
// Headers construction is native; the detached Response method above remains fenced.
