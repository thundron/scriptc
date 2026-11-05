class Scalar {
  constructor(value) { this.value = value; }
}
class Vector {
  constructor(value) { this.value = value; }
}
class Factory {
  create(kind, value) {
    const items = [];
    let Item;
    switch (kind) {
      case 'scalar': Item = Scalar; break;
      default: Item = Vector; break;
    }
    items.push(new Item(value));
    return items;
  }
}
const factory = new Factory();
for (const kind of ['scalar', 'vector']) {
  const items = factory.create(kind, 3);
  console.log(items.length, items[0] instanceof Scalar, items[0] instanceof Vector, items[0].value);
}
