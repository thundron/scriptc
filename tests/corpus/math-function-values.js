const sin = Math.sin;
const cos = Math.cos;
const atan2 = Math.atan2;
const sqrt = Math.sqrt;
const imul = Math.imul;
const abs = Math.abs;
console.log(sin(0), cos(0), sqrt(25), imul(3, 7), abs(-4));
console.log(atan2(0, 1), Object.is(sin(-0), -0), Object.is(abs(-0), 0));
console.log([0, 1, 4, 9].map(sqrt).join(','));
function evaluate(fn, value) { return fn(value); }
console.log(evaluate(cos, 0), evaluate(sqrt, 81));
console.log(sin === Math.sin, sin === cos);
console.log(Number.isNaN(sqrt(-1)), sqrt(Infinity));
