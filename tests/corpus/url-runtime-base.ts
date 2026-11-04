// Both inputs arrive at runtime: the compiler cannot fold these URL calls.
function resolve(input: string, base: string): void {
  try {
    const value = new URL(input, base);
    console.log(value.href, value.protocol, value.host, value.pathname, value.search, value.hash);
  } catch (error) {
    if (error instanceof Error) console.log(error.name, error.message);
  }
}

const http = "https://user:p@host:444/a/b?before#frag";
for (const input of ["", "#", "#next", "?", "?q#f", "../c", "/x", "//new/x", "https:c", "https:/c", "https://c", "https:", "other:x"])
  resolve(input, http);
for (const input of ["./a", "../a", "../../../../a", "%2e%2e/a", ".%2e/a", "a/./b/../c", "a//b", "a/..", "a/.", " a b ", "a\tb\nc\rd", "a\\b", "\\root", "\\\\new\\path"])
  resolve(input, http);
for (const input of ["/root", "../..", "../../..", "../c", "D:/root", "D|/root", "file:foo", "//server/share", "//D:/root", "/D|/root"])
  resolve(input, "file:///C:/a/b");
for (const input of ["a", "/a", "../a", "//new/path", "?query", "#hash", ""])
  resolve(input, "file://server/share/dir/file?query#hash");
for (const input of ["#next", "", "?q", "x", "http://host/", "data:next"])
  resolve(input, "data:a?b#f");
for (const base of ["custom://Host/a/b", "custom:/a/b", "custom://Host", "http://host/", "file:///tmp/project/main.ts"])
  for (const input of ["next", "../next", "?q", "#f", "/root", "//Other/x"])
    resolve(input, base);
resolve("https://valid.example/", "invalid");
resolve("relative", "invalid");
resolve("//[bad]/", http);
resolve("//host:65536/", http);
resolve("é/你好?x=é#你好", http);
resolve("child", " HTTP://EXAMPLE.COM:80/a/../b?x#y ");

let order = "";
function input(): string { order += "input;"; return "../next.ts"; }
function base(): string { order += "base;"; return "file:///tmp/project/main.ts"; }
console.log(new URL(input(), base()).href, order);

function optional(input: string | URL, base?: string | URL): void {
  try { console.log(new URL(input, base).href); }
  catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
}
optional("https://absolute.example/a");
optional("relative");
optional("next", new URL("https://base.example/dir/"));
optional(new URL("https://input.example/a"), "https://base.example/");
optional("../x", "https://base.example/a/b");
console.log(new URL("https://absolute.example/", void (order += "undefined;")).href, order);

const coercedInput = { toString: (): string => { order += "inputString;"; return "../coerced"; } };
function inputObject(): { toString: () => string } { order += "inputObject;"; return coercedInput; }
function baseObject(): string { order += "baseObject;"; return "https://base.example/a/b"; }
console.log(new URL(inputObject(), baseObject()).href, order);
