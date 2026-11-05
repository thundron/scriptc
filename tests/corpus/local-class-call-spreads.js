let trace = [];
function value(label, result) { trace.push(label); return result; }
class Color {
  static rgb(r, g, b, a = value("default", 255)) { return `${r},${g},${b},${a}`; }
}
const rgb = [10, 20, 30];
console.log(Color.rgb(...rgb));
console.log(Color.rgb(...value("spread", [1, 2]), value("last", 3), value("alpha", 4)));
console.log(Color.rgb(value("first", 5), ...value("middle", [6]), ...value("end", [7])));
console.log(trace.join("|"));

function collect(first, second = 9, ...rest) { return `${first}:${second}:${rest.join("-")}`; }
console.log(collect(...[1, 2, 3, 4]));
console.log(collect(...[5]));
console.log(collect(...[], ...[6, undefined, 8]));
function count(first) { return `${first}:${arguments.length}:${arguments[2]}`; }
console.log(count(...[10, 20, 30]));
console.log(count(...rgb));
const sparse = [, 42, ,];
console.log(collect(...sparse));
const grown = [1];
grown.length = 3;
grown[2] = 3;
console.log(collect(...grown));
function fixed(first) { return first; }
console.log(fixed(...value("surplus", [11, 12, 13]), value("discard", 14)));
console.log(trace.join("|"));

function build(seed) {
  return class Stored {
    constructor(a, b = 2) { this.value = seed + a + b; }
    read() { return this.value; }
  };
}
const Stored = build(10);
const instance = new Stored(...[3]);
console.log(instance.read());
