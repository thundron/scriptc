// Publishing a hoisted function does not invoke it or read its captures.
// The dependency still initializes at the require, once across both users.
console.log('main: before');
const member = require('./member.cjs');
console.log(member.describe(), member.renamed());
const read = require('./single.cjs');
console.log(read());
require('./member.cjs');
console.log('main: after');
