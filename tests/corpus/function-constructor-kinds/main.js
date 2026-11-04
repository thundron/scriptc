import { constructorOf } from "./consumer.js";

function* declared() { yield "declared"; }
const generator = function* () { yield "lambda"; };
const regular = () => generator();
const asyncFunction = async () => 1;
const asyncGenerator = async function* () { yield 1; };
const constructors = [declared.constructor, generator.constructor, regular.constructor, asyncFunction.constructor, asyncGenerator.constructor];
for (const ctor of constructors) console.log(typeof ctor, ctor.name, ctor.length);
console.log(declared.constructor === generator.constructor);
console.log(generator.constructor === regular.constructor);
console.log(constructorOf(generator) === declared.constructor);
console.log(constructorOf(asyncGenerator) === asyncGenerator.constructor);
console.log(constructorOf(regular) === regular.constructor);
