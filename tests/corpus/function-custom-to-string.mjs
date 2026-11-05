function render(value) { return value.toString(); }
function first() {}
function second() {}
Object.assign(first, { toString() { return this === first ? "first" : "wrong"; } });
Object.assign(second, { toString() { return "second"; } });
console.log(render(first), render(second));
Object.assign(first, { toString() { return "changed"; } });
console.log(render(first));
