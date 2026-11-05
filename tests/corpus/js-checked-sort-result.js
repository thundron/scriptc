function compare(a, b) { return a.value - b.value; }
class Item {
  constructor(value) { this.value = value; }
}
const items = [new Item(3), new Item(1), new Item(2)];
console.log(items.sort(compare) === items);
console.log(items[0].value, items[1].value, items[2].value);
const bigints = [new Item(3n), new Item(1n)];
try { bigints.sort(compare); }
catch (error) { console.log(error.name); }
