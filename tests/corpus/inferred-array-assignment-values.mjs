const values = new Array(2);
const alias = values;
const write = (index, value) => values[index] = value;
console.log(write(0, 42), alias[0]);
console.log(write("1", "end"), JSON.stringify(values));

const numbers = [0, 0];
const setNumber = (index, value) => numbers[index] = value;
console.log(setNumber(0, 9), setNumber("1", 12), numbers.join(","));

let trace = "";
function receiver() { trace += "receiver "; return values; }
function key() { trace += "key "; return 0; }
function value() { trace += "value "; return 7; }
console.log(receiver()[key()] = value(), values[0], trace);
