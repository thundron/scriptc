import { URL } from "node:url";

function show(label: string, u: URL) {
  console.log(label, u.href, u.protocol, u.username, u.password, u.host, u.hostname, u.port, u.origin);
}

for (const base of ["https://user:pw@old.example:81/a?old=1#before", "http://old.example:443/a", "foo://Mixed.example:81/a", "foo://", "foo:/a", "file://server/C:/a", "file:///C:/a", "data:text/plain,hello"]) {
  const u = new URL(base);
  const params = u.searchParams;
  for (const value of ["new user", "a:b@c/ü\t\r\n", "%2f", ""]) {
    u.username = value;
    show("username", u);
  }
  for (const value of ["new secret", "a:b@c/ü\t\r\n", "%2f", ""]) {
    u.password = value;
    show("password", u);
  }
  for (const value of ["NEW.example", "new.example:00443junk", "new.example:", "new.example:bad", "new.example:65536", "new.example/path?ignored#ignored", "[0:0:0:0:0:0:0:1]:0082", "bad host", "user@host", "[bad]", ""]) {
    u.host = value;
    show("host", u);
  }
  for (const value of ["OTHER.example", "[2001:0DB8:0:0::1]", "other.example:90", "other.example/path", "local\thost", "bad host", ""]) {
    u.hostname = value;
    show("hostname", u);
  }
  for (const value of ["", "00080", "443", "65535", "65536", "999999999999999999999999", "12.75", "4e21", "123suffix", "-1", " 90", "bad", "\t", "8\t0"]) {
    u.port = value;
    show("port", u);
  }
  for (const value of ["HTTP", "https:ignored", "ws:", "wss", "ftp", "file", "foo", "custom+v1:", "1bad", "bad scheme", "\thtt\nps\r:", ""]) {
    u.protocol = value;
    show("protocol", u);
  }
  console.log("view", params === u.searchParams, params.toString());
  params.set("next", "value");
  console.log("query", u.href);
}

const u = new URL("https://old.example:81/a");
const alias = u;
console.log("assigned", u.port = "0082suffix", alias.port);
console.log("compound", u.port += "3", u.port);
console.log("user-compound", u.username += "a b", u.username);
const key = "hostname";
console.log("key", u[key] = "NEW.example", alias.href);
u.password = "secret";
u.username = "";
show("password-only", u);
u.password = "";
show("credentials-cleared", u);
u.href = "foo:/a";
u.pathname = "//path";
u.hostname = "new.example";
show("authority-added", u);
u.href = "foo:/a";
u.pathname = "//path";
u.host = "new.example:82";
show("host-port-added", u);
console.log("escaped-components", u.pathname, u.host);
u.port = "bad";
console.log("escaped-ignored", u.href, u.pathname, u.host);
u.port = "82";
console.log("escaped-next-write", u.href, u.pathname, u.host);
u.href = "foo:/a";
u.pathname = "//path";
u.hostname = "";
show("empty-authority", u);
