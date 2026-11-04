/** @param {number} value */
function scalar(value) { return value; }
class Matrix {
  /** @param {number} x @param {number} y @param {number} z */
  translate(x, y, z) {
    console.log(x, y, z, typeof y, y === undefined);
    return y;
  }
}
console.log(scalar(), scalar(3));
const matrix = new Matrix();
console.log(matrix.translate(2));
console.log(matrix.translate(2, 4, 6));
const alias = scalar;
console.log(alias(), alias(5));
/** @param {number} value */
function increment(value) { return value + 1; }
console.log(increment(), increment(2));
console.log(increment(undefined), increment(void console.log('argument effect')));
/** @param {string} value */
function echo(value) { return value; }
const echoAlias = echo;
console.log(echoAlias(), echoAlias('hello'));
class DerivedMatrix extends Matrix {
  /** @param {number} x @param {number} y @param {number} z */
  translate(x, y, z) {
    console.log('derived', x, y, z);
    return y;
  }
}
/** @param {Matrix} value */
function invoke(value) { console.log(value.translate(1)); }
invoke(new DerivedMatrix());
