import { isDeepStrictEqual as equal } from "node:util";
console.log("holes", equal([, 1], [undefined, 1]), equal([, 1], [, 1]), equal([,], []));
/** @type {any} */
const a = [1, 2];
/** @type {any} */
const b = [1, 2];
a.extra = 3;
b.extra = 4;
console.log("array props", equal(a, b));
b.extra = 3;
console.log("array props equal", equal(a, b));
const key = Symbol("key");
const other = Symbol("key");
/** @type {any} */
const x = { [key]: { value: 1 } };
/** @type {any} */
const y = { [key]: { value: 1 } };
console.log("symbol props", equal(x, y), equal(x, { [other]: { value: 1 } }));
Object.defineProperty(x, "hidden", { value: 1 });
Object.defineProperty(y, "hidden", { value: 2 });
console.log("hidden", equal(x, y));
/** @type {any} */
const selfA = { value: 1 };
/** @type {any} */
const selfB = { value: 1 };
selfA.self = selfA;
selfB.self = selfB;
console.log("cycles", equal(selfA, selfB));
selfB.value = 2;
console.log("cycles different", equal(selfA, selfB));
/** @type {any} */
const arrA = [];
/** @type {any} */
const arrB = [];
arrA.push(arrA);
arrB.push(arrB);
console.log("array cycles", equal(arrA, arrB));
const proto = { inherited: 1 };
const p = Object.create(proto);
p.value = 1;
console.log("custom proto", equal(p, { value: 1 }), equal(p, { value: 1 }, true));
const tagA = JSON.parse('{}');
const tagB = JSON.parse('{}');
Object.defineProperty(tagA, Symbol.toStringTag, { value: 'Alpha' });
Object.defineProperty(tagB, Symbol.toStringTag, { value: 'Beta' });
console.log("hidden tags", equal(tagA, tagB), equal(tagA, tagB, true));
console.log("one hidden tag", equal(tagA, {}));
/** @type {any} */
const hiddenArray = [1];
Object.defineProperty(hiddenArray, 'hidden', { value: 1 });
console.log("hidden array prop", equal(hiddenArray, [1]));
