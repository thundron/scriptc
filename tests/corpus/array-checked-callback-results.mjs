const generated = Array.from({ length: 2 }, (_, index) => new Date(index * 1000));
console.log(generated.length, generated[0].getTime(), generated[1].toISOString());
const flattened = [1, 2].flatMap((value) => new Date(value * 1000));
console.log(flattened.length, flattened[0].getTime(), flattened[1].getTime());
/** @type {[number]} */
const tuple = [3];
const mapped = tuple.map((value) => new Date(value * 1000));
console.log(mapped.length, mapped[0].getTime());
console.log([1, 2].map((value) => JSON.parse(value === 1 ? '"first"' : 'null')).join("|"));
