class Vector {
  static { Vector.prototype.isVector = true; }
  constructor(x = 0) { this.x = x; }
}
class ColoredVector extends Vector {
  static { ColoredVector.prototype.color = 'red'; }
}
const first = new Vector(3);
const second = new Vector(4);
const child = new ColoredVector(5);
console.log(first.x, first.isVector, second.isVector, child.isVector, child.color);
console.log(Object.hasOwn(first, 'isVector'), Object.keys(first).join(','));
Vector.prototype.isVector = false;
console.log(first.isVector, second.isVector, child.isVector);
first.isVector = true;
console.log(first.isVector, second.isVector, Object.hasOwn(first, 'isVector'));
ColoredVector.prototype.isVector = true;
console.log(child.isVector, second.isVector);
console.log(Vector.prototype.isVector, ColoredVector.prototype.isVector);
function read(value) { return value.isVector; }
console.log(read(first), read(second), read(child));
/** @param {unknown} value */
function snapshot(value) { return JSON.stringify(value); }
console.log(snapshot(first), snapshot(second), snapshot(child));
/** @param {unknown} value */
function inherited(value) { return 'isVector' in value; }
console.log(inherited(first), inherited(second), inherited(child));
// Assignment is discovered after this instance's checked view is created.
class LateVector { constructor() { this.x = 8; } }
class LateChild extends LateVector {}
const late = new LateChild();
console.log(read(late));
LateVector.prototype.isVector = 'late';
console.log(read(late), late.isVector, Object.hasOwn(late, 'isVector'));
LateChild.prototype.isVector = undefined;
console.log(read(late), late.isVector, inherited(late));
late.isVector = 'own';
console.log(read(late), snapshot(late), Object.keys(late).join(','));
