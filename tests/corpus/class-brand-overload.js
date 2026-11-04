class Point {
  static { Point.prototype.isPoint = true; }
  constructor(x = 0) { this.x = x; }
}
/** @param {number} [value] */
function scalar(value) { return value === undefined ? 'missing' : value.toString(); }
/** @param {number|Point} value */
function coordinate(value) {
  if (value.isPoint) return scalar(value.x);
  return scalar(value);
}
console.log(coordinate(7), coordinate(new Point(9)), coordinate(0));
/** @param {number|Point|undefined} value */
function optionalBrand(value) { return value?.isPoint; }
console.log(optionalBrand(undefined), optionalBrand(2), optionalBrand(new Point(3)));
