import { fileURLToPath } from "node:url";

const url = new URL("file:///tmp/scriptc%20url");
const values: unknown[] = [null, undefined, "file:///tmp/a", {}, url];
for (const value of values) {
  console.log(value instanceof URL);
  if (value instanceof URL) console.log(value.href, fileURLToPath(value));
}
const box: { value: unknown } = { value: url };
console.log(box.value === url, url === url, url === new URL(url.href));
console.log(String(url), String(box.value));
const same = box.value as URL;
console.log(same === url, same.protocol, same.pathname);
function bounce(value: unknown): unknown { return value; }
console.log(bounce(url) === url, bounce(url) instanceof URL);
