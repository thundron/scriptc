import { prototypeOf } from "./consumer.js";

function original() {}
console.log(prototypeOf(original).constructor === original);
console.log(Object.keys(original).join(","));
const replacement = { value: 1 };
original.prototype = replacement;
console.log(original.prototype === replacement, original.prototype.value);
const descriptor = Object.getOwnPropertyDescriptor(original, "prototype");
console.log(descriptor.writable, descriptor.enumerable, descriptor.configurable);
const arrow = () => 0;
console.log(prototypeOf(arrow));
arrow.prototype = replacement;
console.log(arrow.prototype === replacement, Object.keys(arrow).join(","));
const expression = function () {};
console.log(expression.prototype.constructor === expression);
