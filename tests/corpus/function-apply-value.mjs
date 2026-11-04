const apply = Function.prototype.apply;
function method(a, b) { return this.prefix + a + b; }
function read(fn) { return fn.apply; }
console.log(read(method) === apply);
console.log(apply.call(method, { prefix: "sum:" }, [2, 3]));
console.log(apply.call(method, { prefix: "object:" }, { 0: 2, 1: 3, length: 2 }));
console.log(method.apply({ prefix: "direct:" }, { 0: 2, 1: 3, length: 2 }));
const key = Symbol("apply");
method[key] = apply;
console.log(method[key]({ prefix: "next:" }, [4, 5]));
function remove(fn, symbol) { delete fn[symbol]; }
remove(method, key);
const assign = Object.assign;
const target = { a: 1 };
console.log(assign(target, { b: 2 }, { a: 3 }) === target);
console.log(JSON.stringify(target));
