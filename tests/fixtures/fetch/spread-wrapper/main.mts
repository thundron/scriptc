/// <reference types="node" />
const baseUrl = process.argv[2]!;
const base: { init: RequestInit } = { init: { cache: "no-store" } };
const options: { init: RequestInit } = { ...base, init: { method: "GET" } };
const response = await fetch(`${baseUrl}/text`, options.init);
const text: string = await response.text();
console.log(`${response.status}`, text);

let order = "";
function source(): { init: RequestInit } {
  order += "source";
  return base;
}
function replacement(): RequestInit {
  order += ",replacement";
  return { method: "POST", body: "spread body" };
}
const copied: { init: RequestInit } = { ...source(), init: replacement() };
const posted = await fetch(`${baseUrl}/post-echo`, copied.init);
const body = await posted.json() as { method: string; body: string };
console.log(order, body.method, body.body);
