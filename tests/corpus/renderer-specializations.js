function collect(seed) {
  var result = [String(seed)];
  for (const [key, value] of Object.entries({ first: "one", second: "two" })) result.push(key + value);
  for (const { name, count } of [{ name: "three", count: 3 }]) result.push(name + count);
  var suffix = "!";
  result.push(read());
  function read() { return suffix; }
  const later = () => last;
  const last = "end";
  result.push(later());
  return result.join(",");
}
console.log(collect(1));
console.log(collect("two"));
class Parser {
  value = null;
  parse(input) { return input ? this.value : null; }
  async settle(input) { return await Promise.resolve(input); }
}
const parser = new Parser();
console.log(parser.parse(false));
parser.value = "parsed";
console.log(parser.parse(true));
console.log(await parser.settle("ready"));
const parserAlias = { parser };
console.log(await parserAlias.parser.settle(7));
class Feed {
  get id() { return "feed"; }
  close(value) { console.log(this.id, value); }
}
function argument() { console.log("argument"); return "closed"; }
function makeFeed() { return new Feed(); }
let feed = null;
feed?.close(argument());
feed = makeFeed();
console.log(feed.id);
feed?.close(argument());
