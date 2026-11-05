class Shape {
  constructor(size = 1) { this.size = size; }
  copy(source, recursive = true) { return source.size + (recursive ? 1 : 0); }
  area() { return this.size * this.size; }
}
class ColoredShape extends Shape {
  constructor(size = 1) { super(size); this.color = 'red'; }
  copy(source, recursive) { return source.size + (recursive ? 1 : 0); }
}
const shape = new ColoredShape(3);
console.log(shape.area(), shape.color, new Shape(2).copy(shape));
