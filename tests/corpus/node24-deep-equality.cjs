const { isDeepStrictEqual: equal } = require("node:util");
const util = require("util");
const compare = util.isDeepStrictEqual;
console.log("missing", equal(), equal(undefined), equal(1), compare());
console.log("alias", equal === compare, compare({ a: [1] }, { a: [1] }));
const a = Object.create(null);
a.value = { inner: 1 };
const b = { value: { inner: 1 } };
console.log("prototype", equal(a, b), equal(a, b, false), equal(a, b, true));
console.log("truthiness", equal(a, b, 0), equal(a, b, "yes"), equal(a, b, { skipPrototype: false }));
console.log("recursive", equal({ a }, { a: b }), equal({ a }, { a: b }, true));
const trace = [];
function argument(label, value) { trace.push(label); return value; }
console.log("arguments", equal(argument("a", 1), argument("b", 1), argument("option", false), argument("extra", 2)), trace.join(","));
const first = { value: 1 };
const second = { value: 2 };
function update() { first.value = 2; return 0; }
console.log("late mutation", equal(first, second, false, update()));
