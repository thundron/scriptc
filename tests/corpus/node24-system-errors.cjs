const util = require("node:util");
const { getSystemErrorName: name, getSystemErrorMessage: message, getSystemErrorMap: all } = require("util");
console.log(util.getSystemErrorName(-3001), util.getSystemErrorMessage(-3001));
console.log(name(-3001), message(-3001), all().size);
console.log(all().get(-3001)[0], all().get(-3001)[1]);
