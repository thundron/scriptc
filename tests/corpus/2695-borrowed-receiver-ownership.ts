let record = { x: 1, y: 2 };
const originalRecord = record;
record.x = (record = { x: 30, y: 40 }, 9);
console.log(originalRecord.x, record.x);

class Box {
  value: number;
  constructor(value: number) { this.value = value; }
}
let box = new Box(1);
const originalBox = box;
box.value = (box = new Box(30), 9);
console.log(originalBox.value, box.value);

let items = [1, 2, 3];
const originalItems = items;
items[(items = [30, 40], 0)] = 9;
console.log(originalItems[0], items[0]);

const stable = { x: 2, y: 3 };
for (let i = 0; i < 100; i++) {
  stable.x = i;
  stable.y = stable.x + 1;
}
console.log(stable.x, stable.y);
