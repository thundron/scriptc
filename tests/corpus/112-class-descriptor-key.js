class Bag { constructor() { this.x = 1; } }
const bag = new Bag();
Object.defineProperty(bag, String("data"), { value: 2 });
console.log(bag.x, bag.data);
