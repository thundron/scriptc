import { URL as NodeURL } from "node:url";
console.log(NodeURL.canParse("../child", "https://example.com/a/b"));
const parsed = NodeURL.parse("../child?x=1", "https://example.com/a/b");
if (parsed !== null) {
  parsed.searchParams.set("added", "two words");
  console.log(parsed.toJSON(), parsed.toString(), JSON.stringify(parsed));
}
console.log(NodeURL.parse("invalid") === null);
