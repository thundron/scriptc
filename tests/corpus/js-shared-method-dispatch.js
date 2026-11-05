class Widget {
  work(value) { return this.base + value; }
  constructor() { this.base = 10; }
}
const first = new Widget(), second = new Widget();
function replace() {
  first.work = function (value) { return this.base * value; };
  return 2;
}
console.log(first.work(replace()), first.work(3), second.work(4));
first.work = 1;
second.work = 2;
try { first.work(0); } catch (error) { console.log(error.message); }
try { second.work(0); } catch (error) { console.log(error.message); }
