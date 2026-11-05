const { stripVTControlCharacters: strip, toUSVString: usv } = require("node:util");
const util = require("util");
const stripValue = util.stripVTControlCharacters;
const usvValue = util.toUSVString;
console.log(strip("\u001b[1mhello\u001b[0m"), stripValue("\u001b]0;title\u001b\\hello"));
console.log(usv("a\ud800b"), usvValue("😀"));
console.log(strip === stripValue, usv === usvValue);
