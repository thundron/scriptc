function isObject(value) { return typeof value === "object" && value !== null; }
function minimum(value) { return isObject(value) ? value.min : value; }
console.log(minimum(3), minimum({ min: 7 }));
function read(value) { return value.missing; }
console.log(read(1), read(false), read(2n), read("text"));
