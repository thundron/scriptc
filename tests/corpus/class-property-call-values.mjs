class Table {
  constructor() { this.initialize(); }
  initialize() { this.entries = {}; }
  write(key, value) { this.entries[key] = value; }
  read(key) { return this.entries[key]; }
  install() { this.compute = function(value) { return this.read('factor') * value; }; }
}
const table = new Table();
table.write('factor', 3);
table.install();
console.log(table.compute(4));
const key = Math.random() < 2 ? 'factor' : 3;
console.log(table.read(key));
table.write(3, 7);
console.log(table.read(3));
class First { result(value) { return value + 1; } }
class Second { result(value) { return value * 2; } }
const chosen = Math.random() < 2 ? new First() : new Second();
console.log(chosen.result(3));
