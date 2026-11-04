const {styleText} = require("node:util");
const util = require("util");
const stored = util.styleText;
console.log("identity", stored === styleText);
console.log(JSON.stringify(stored(["bold", "green"], "hello", {validateStream: false})));
console.log(JSON.stringify(util.styleText("none", "plain")));
console.log(JSON.stringify(styleText("red", "before\u001b[39mafter", {validateStream: false})));
