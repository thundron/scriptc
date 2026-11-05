const bytes = new Uint8Array(4);
const numbers = [0, 0, 0, 0];
let trace = "";
function target(): Uint8Array { trace += "receiver "; return bytes; }
function index(n: number): number { trace += "index" + n + " "; return n; }
function value(): number { trace += "value "; return 257.5; }
console.log(target()[index(0)] = target()[index(1)] = value());
console.log(bytes[0], bytes[1], trace);
console.log(numbers[0] = numbers[1] = 9, numbers.join(","));
console.log(bytes[99] = -7.5, bytes.length);
console.log(bytes[-1] = 12.5, bytes[0.5] = 12.5, bytes[NaN] = 12.5, bytes[Infinity] = 12.5, bytes[-Infinity] = 12.5);
const floats = new Float32Array(1);
const assigned = floats[0] = 1 / 3;
console.log(assigned === 1 / 3, floats[0] === Math.fround(1 / 3));
let current = new Uint8Array(1);
const original = current;
function replace(): number { current = new Uint8Array(1); return 6; }
console.log(current[0] = replace(), original[0], current[0]);
