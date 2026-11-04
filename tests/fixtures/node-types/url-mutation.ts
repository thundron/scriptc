import { URL as NodeURL } from "node:url";

function update(u: NodeURL) {
  const params = u.searchParams;
  const alias = u;
  u.protocol = "http";
  u.username = "new user";
  u.password = "new secret";
  u.host = "NEW.example:81";
  u.hostname = "OTHER.example";
  u.port += "2";
  u.pathname = "/a/../new path";
  console.log(u.search = "a=two words", u.href);
  u.hash += "new fragment";
  const key = "href";
  u[key] = "http://other.example:80/final?b=3";
  console.log(alias.href, alias.origin, params === u.searchParams, params.toString());
  params.set("last", "~");
  console.log(u.toJSON());
  try { u.href = "invalid"; } catch (error) {
    if (error instanceof TypeError) console.log(error.name, error.message);
  }
  console.log(u.href);
  const box: { value: unknown } = { value: u };
  const checked = box.value as any;
  checked.search = "checked=yes";
  console.log(u.href, params.toString());
  try { checked.hash = Symbol("bad"); } catch (error) {
    if (error instanceof TypeError) console.log(error.name, error.message, u.hash);
  }
}

update(new NodeURL("https://h/old?old=1#before"));
update(new URL("https://h/old?old=1#before"));
const parsed = NodeURL.parse("https://h/parsed");
if (parsed !== null) {
  parsed.hash = "final";
  parsed.search = "parsed=yes";
  console.log(parsed.href);
}
