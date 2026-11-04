class Curve {
  point(t, target) { return target; }
  sample(t) { return this.point(t); }
}
class Line extends Curve {
  point(t, target = { x: 0 }) { target.x = t * 2; return target; }
}
class Offset extends Line {
  point(t = 3, target = { x: 1 }) { target.x += t; return target; }
}
for (const curve of [new Line(), new Offset()]) {
  console.log(curve.sample(0.5).x, curve.point().x);
  const target = { x: 4 };
  console.log(curve.point(2, target) === target, target.x);
}
class Loader {
  parse() {}
  read(value) { return this.parse(value); }
}
class TextLoader extends Loader {
  parse(value = 'default') { return { text: value }; }
}
class CountLoader extends Loader {
  parse(value = 5) { return value + 1; }
}
console.log(new Loader().read('x'));
console.log(new TextLoader().read('abc').text, new TextLoader().parse().text);
console.log(new CountLoader().read(8), new CountLoader().parse());
