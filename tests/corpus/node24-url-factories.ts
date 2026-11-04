import { URL as NodeURL } from "node:url";

function check(input: string | NodeURL, base?: string | NodeURL): void {
  const parsed = URL.parse(input, base);
  console.log(URL.canParse(input, base), parsed === null);
  if (parsed !== null) {
    console.log(parsed.href, parsed.toString(), parsed.toJSON());
    console.log(parsed.protocol, parsed.origin, parsed.username, parsed.password, parsed.host, parsed.hostname, parsed.port, parsed.pathname, parsed.search, parsed.hash);
    const view = parsed.searchParams;
    view.set("added", "two words");
    console.log(view === parsed.searchParams, parsed.toJSON(), JSON.stringify(parsed));
  }
}

for (const input of ["https://USER:p@Example.com:443/a/../b?x=1#f", "http://[2001:db8::1]:8080/a", "file:///tmp/a%20b", "custom://Host/a/b", "mailto:a@example.com", "data:text/plain,hello", "blob:https://example.com/id", "invalid", "//example.com", "http://host:65536", "http://[bad]/"]) check(input);
for (const input of ["", "#next", "?query", "../child", "//Other/path", "https:next", "/root", "a\\b", "é/你好?x=é#你好"])
  check(input, "https://u:p@host:444/a/b?before#frag");
for (const input of ["../child", "//server/share", "D:/root", "#hash"])
  check(input, "file:///C:/a/b");
check("https://valid.example/", "invalid");
check("#next", "data:a?b#f");
check("next", new URL("https://base.example/dir/"));
check(new URL("https://input.example/a"));
console.log(NodeURL.canParse("/child", "https://example.com"), NodeURL.parse("../x", "https://example.com/a/b")?.href);

let trace = "";
function input(): string { trace += "input;"; return "../next"; }
function base(): string { trace += "base;"; return "https://example.com/dir/file"; }
console.log(URL.canParse(input(), base()), trace);
console.log(URL.parse(input(), base())?.href, trace);
console.log(URL.parse("https://example.com", void (trace += "undefined;"))?.href, trace);
const custom = { toString: (): string => { trace += "coerce;"; return "https://example.com/coerced"; } };
console.log(URL.canParse(custom as unknown as string), URL.parse(custom as unknown as string)?.href, trace);
