const values = new Array(4).fill(0);
let reads = 0;
function index() { reads++; return 1; }
const sum = values[index()] += 7;
const shifted = values[1] <<= 2;
const text = values[2] += "x";
console.log(JSON.stringify(values), sum, shifted, text, reads);

const object = { value: 2 };
let order = "";
const key = { toString() { order += "k"; return "value"; } };
const result = object[key] += (() => { order += "r"; return 3; })();
console.log(result, object.value, order);
