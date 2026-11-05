function make(values) { return new Set(values); }
const source = JSON.parse('[1,2,2,3]');
const set = make(source);
console.log(set.size, set.has(2), set.has(4));
console.log(make(null).size, make(undefined).size, make('aba').size);
const key = {};
/** @type {unknown[]} */
const entries = JSON.parse('[1,"1"]');
entries.push(key, key, NaN, NaN);
const mixed = make(entries);
console.log(mixed.size, mixed.has(key));
try {make(42);} catch(e) {console.log(e.name);}
