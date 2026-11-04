const u = new URL("https://h/a?initial=yes#before");
const alias = u;
const params = u.searchParams;
for (const value of /** @type {any[]} */ ([12, false, null, undefined, 42n, ["one", "two"]])) {
  const result = u.search = value;
  console.log("value", result === value, u.search, u.href);
}
const events = [];
const value = { toString() { events.push("convert"); u.hash = "during"; return "a b#c"; } };
console.log("object", (u.search = value) === value, events.join(","), u.href);
try { u.hash = Symbol("bad"); } catch (error) { console.log("symbol", error.name, error.message, u.hash); }
try { u.search = { toString() { throw new RangeError("conversion"); } }; } catch (error) { console.log("throw", error.name, error.message, u.search); }
u.href = "https://new.example/x?updated=1";
console.log("alias", alias.href, params === u.searchParams, params.get("updated"));
const unknown = /** @type {any} */ (u);
unknown.search = "checked=yes";
console.log("checked", u.href, params.toString());
u.pathname = { toString() { u.search = "during=yes"; return "next path"; } };
console.log("path-convert", u.href, params.toString());
u.hash = { toString() { u.pathname = "during"; return "after"; } };
console.log("hash-convert", u.href);
u.href = { toString() { u.hash = "during"; return "https://final.example/end?final=yes"; } };
console.log("href-convert", u.href, params.toString());
u.href = "data:opaque#old";
u.pathname = { toString() { u.hash = "during"; return "ignored"; } };
console.log("opaque-convert", u.href);
