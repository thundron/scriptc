import { styleText } from "node:util";
import * as util from "util";
const stored = styleText;
const formats = ["reset", "bold", "dim", "italic", "underline", "blink", "inverse", "hidden", "strikethrough", "doubleunderline", "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "framed", "overlined", "gray", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright", "bgGray", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright", "grey", "blackBright", "bgGrey", "bgBlackBright", "faint", "crossedout", "strikeThrough", "crossedOut", "conceal", "swapColors", "swapcolors", "doubleUnderline", "none"];
for (const format of formats) {
  for (const text of ["", "café 😀", "first\nsecond", "a\u001b[39mb", "a\u001b[22mb", "a\u001b[24mb", "a\u001b[0mb", "a\u001b[39m", "embedded\u0000end"]) {
    console.log(format, JSON.stringify(styleText(format, text, { validateStream: false })));
  }
}
for (const format of [[], ["none"], ["bold", "green"], ["red", "green"], ["dim", "bold", "dim"], ["none", "underline", "italic"], ["reset", "red"]]) {
  console.log("array", JSON.stringify(stored(format, "before\u001b[39mmiddle\u001b[22mafter", { validateStream: false })));
}
console.log("identity", styleText === stored, styleText === util.styleText);
console.log("nested", JSON.stringify(styleText("red", styleText("blue", "nested", { validateStream: false }) + " tail", { validateStream: false })));
console.log("default", JSON.stringify(styleText("none", "plain")));
