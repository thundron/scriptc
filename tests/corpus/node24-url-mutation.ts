import { URL } from "node:url";

function show(label: string, u: URL) {
  console.log(label, u.href, u.pathname, u.search, u.hash, u.searchParams.toString());
}

for (const base of ["https://user:pw@h:81/a?old=1#before", "foo://h", "foo://", "foo:/a", "file:///C:/a", "data:text/plain,hello"]) {
  const u = new URL(base);
  const params = u.searchParams;
  for (const value of ["", "///x", "a b\tc\r\n?#ü", "/a/%2e%2e/b", "/D|/x"]) {
    u.pathname = value;
    show("path", u);
  }
  for (const value of ["", "?", "??x", "\t?x", "\t", "a b\tc\r\n?#ü'", "x=%FF&x=second"]) {
    u.search = value;
    show("query", u);
    console.log("same", params === u.searchParams, params.getAll("x").join("|"));
  }
  for (const value of ["", "#", "##x", "\t#x", "\n", "a b\tc\r\n?#ü`", "%2f"]) {
    u.hash = value;
    show("fragment", u);
  }
  params.set("next", "~ ü");
  show("params", u);
  u.href = "http://new.example:80/b/../c?fresh=two+words#end";
  show("replace", u);
  console.log("identity", params === u.searchParams, params.get("fresh"), u.origin, u.protocol, u.host, u.username);
  params.append("last", "value");
  show("old-view", u);
  const before = u.href;
  try { u.href = "relative"; } catch (error) { if (error instanceof TypeError) console.log("invalid", error.name, error.message); }
  console.log("retained", u.href === before, params === u.searchParams);
}

const u = new URL("https://h/a");
const alias = u;
let order = "";
function receiver() { order += "r"; return u; }
function value() { order += "v"; u.search = "during=yes"; return "after=done"; }
console.log("yield", receiver().search = value(), order, alias.search);
order = "";
console.log("compound", receiver().search += value(), order, u.search);
const key = "hash";
console.log("computed", u[key] = "unescaped space", u.hash);
console.log("empty", u.search = "?", u.search, u.href);
u.href = "foo:/a";
u.pathname = "//host/path";
console.log("hostless", u.href, u.pathname, u.host);
