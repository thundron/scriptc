const u = new URL("https://old.example:81/a?old=1#before");
const params = u.searchParams;
for (const value of /** @type {any[]} */ ([0, 1234.567, 4.567e21, 1e10, false, null, undefined, 42n, ["12", "34"]])) {
  console.log("port", (u.port = value) === value, u.port, u.href);
}
u.username = 12;
u.password = false;
u.hostname = { toString() { return "NEW.example"; } };
console.log("primitive", u.href);
u.protocol = { toString() { u.hash = "during"; return "http"; } };
console.log("protocol-convert", u.href);
u.protocol = { toString() { u.hash = "during"; return "bad scheme"; } };
console.log("protocol-invalid", u.href);
u.protocol = { toString() { u.hash = "during"; return "custom"; } };
console.log("protocol-boundary", u.href);
u.username = { toString() { u.hash = "during"; return "new user"; } };
console.log("user-convert", u.href);
u.password = { toString() { u.hash = "during"; return "new secret"; } };
console.log("password-convert", u.href);
u.host = { toString() { u.hash = "during"; return "other.example:bad"; } };
console.log("host-convert", u.href);
u.host = { toString() { u.hash = "during"; return "bad host"; } };
console.log("host-invalid", u.href);
u.hostname = { toString() { u.hash = "during"; return "final.example"; } };
console.log("hostname-convert", u.href);
u.port = { toString() { u.hash = "during"; return "82suffix"; } };
console.log("port-convert", u.href);
u.port = { toString() { u.hash = "during"; return "invalid"; } };
console.log("port-invalid", u.href);
try { u.username = Symbol("bad"); } catch (error) { console.log("symbol", error.name, error.message, u.href); }
try { u.port = { toString() { throw new RangeError("conversion"); } }; } catch (error) { console.log("throw", error.name, error.message, u.href); }
const box = { value: /** @type {unknown} */ (u) };
const checked = /** @type {any} */ (box.value);
checked.hostname = "checked.example";
checked.port = 8080;
checked.username = "checked user";
checked.password = "checked secret";
checked.protocol = "https";
checked.host = "last.example:443";
console.log("checked", u.href, params === u.searchParams, params.toString());
u.href = "file:///a?old=1#before";
u.username = { toString() { u.hash = "user-during"; return "ignored"; } };
u.password = { toString() { u.hash = "password-during"; return "ignored"; } };
u.port = { toString() { u.hash = "port-during"; return "82"; } };
console.log("file-ignored", u.href);
u.href = "data:opaque#before";
u.host = { toString() { u.hash = "host-during"; return "ignored"; } };
u.hostname = { toString() { u.hash = "hostname-during"; return "ignored"; } };
console.log("opaque-ignored", u.href);
