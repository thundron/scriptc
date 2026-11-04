import { stripVTControlCharacters as strip, toUSVString as usv } from "node:util";
import * as util from "util";

const stripValue = util.stripVTControlCharacters;
const usvValue = util.toUSVString;
for (const text of ["", "plain café 😀", "line\n\tend\r", "\u001b[31mred\u001b[0m", "\u009b1;32mgreen\u009b0m", "\u001b[2J\u001b[Hclear", "\u001b]0;window title\u0007tail", "\u001b]8;;https://example.com\u001b\\link\u001b]8;;\u001b\\", "\u001b]0;title\u009ctail", "\u001b[?25lhidden\u001b[?25h", "\u001b[38;2;1;2;3mRGB\u001b[0m", "\u001b7saved\u001b8", "\u001b[", "\u001b]unterminated", "\u001b\\", "embedded\u0000\u001b[1mNUL\u001b[0m"] ) {
  console.log(JSON.stringify(strip(text)), JSON.stringify(stripValue(text)));
}
for (const text of ["", "café 😀", "\ud800", "\udfff", "a\ud800z", "\ud800\ud800\udc00\udc00", "\ud83d\ude00", "\udc00\ud800", "\udbff\udfff"] ) {
  console.log(JSON.stringify(usv(text)), JSON.stringify(usvValue(text)));
}
// Repeated calls keep the shared regex bytecode's state independent.
console.log(strip("\u001b[31mone"), strip("\u001b[32mtwo"), strip("three"));
let digest = 0;
for (const intro of ["\u001b", "\u009b"]) {
  for (const body of ["", "[", "]", "[31", "[1;2", "]0;title", "]8;;https://x", ";x/y#&.:=?%@~_", "[?25", "[12345", "[;;", "(B", "abc;xyz", "abc;", "[]#;?"]) {
    for (let code = 0; code < 160; code++) {
      const result = strip("前" + intro + body + String.fromCharCode(code) + "後");
      for (let i = 0; i < result.length; i++) digest = (digest * 31 + result.charCodeAt(i)) >>> 0;
    }
  }
}
console.log("control-matrix", digest);
