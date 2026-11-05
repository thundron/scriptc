class Counter {
  value = 3;
  scale(factor: number): number { return this.value * factor; }
}
class DerivedCounter extends Counter {
  scale(factor: number): number { return super.scale(factor) + 1; }
}
const counter = new Counter();
const derived = new DerivedCounter();
const original = Counter.prototype['scale'];
Counter.prototype.scale = (factor: number): number => factor + 10;
console.log(counter.scale(2), derived.scale(2));
Counter.prototype.scale = original;
console.log(counter['scale'](2), derived['scale'](2));
class Alternate {
  scale(factor: number): number { return factor * 10; }
}
const selected = Math.random() < 2 ? counter : new Alternate();
Counter.prototype.scale = (factor: number): number => factor + 20;
console.log(selected.scale(2));
Counter.prototype.scale = original;
