const patterns = { caret: /(^|[^\[])\^/g };
function edit(value, flags = "") {
  let source = typeof value == "string" ? value : value.source, builder = {
    replace: (pattern, replacement) => {
      let text = typeof replacement == "string" ? replacement : replacement.source;
      return text = text.replace(patterns.caret, "$1"), source = source.replace(pattern, text), builder;
    },
    getRegex: () => new RegExp(source, flags)
  };
  return builder;
}
console.log(edit(/^start end$/).replace("start", /hello/).replace("end", /world/).getRegex().test("hello world"));

function identity(value) { return value; }
const original = new RegExp("hello", "im");
const boxed = identity(original);
console.log(typeof original, typeof boxed, boxed.source, boxed.flags, boxed.ignoreCase, boxed.global);
console.log(boxed === identity(original), String(boxed), Object.prototype.toString.call(boxed));
console.log(boxed.test("HELLO"), boxed.test({ toString() { return "hello"; } }), boxed instanceof RegExp);
console.log(new RegExp(boxed).flags, new RegExp(boxed, "g").flags);
console.log(new RegExp(identity(undefined)).source);
try { new RegExp(identity("[")); } catch (error) { console.log(error.name); }
try { new RegExp(boxed, identity("ii")); } catch (error) { console.log(error.name); }
function replace(source, pattern, text) { return source.replace(pattern, text); }
console.log(replace("😀hello hello", /hello/g, "[$&]"));
console.log(replace("hello hello", "hello", "$$$&"));
console.log(edit(/^left right$/i, "i").replace(/left/g, /^hello/).replace("right", /^world/).getRegex().test("HELLO WORLD"));
const own = { replace(value) { return "own:" + value; }, trim() { return "own trim"; } };
console.log(own.replace("x"), own.trim());

console.log(edit("^left right$").replace("left", /^hello/).replace("right", "world").getRegex().test("hello world"));
console.log(new RegExp("a") === new RegExp("a"));

const neverMatches = { exec: () => null };
const mixedRules = { word: /hello/, fallback: neverMatches };
console.log(mixedRules.word.test("hello"), mixedRules.fallback.exec(), mixedRules.fallback === neverMatches);
const copiedRules = { ...mixedRules, word: /world/ };
console.log(copiedRules.word.test("world"), mixedRules.word.test("hello"), copiedRules.fallback === neverMatches);
