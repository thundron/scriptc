class Dimensions {
  /** @param {number} width @param {number} height */
  constructor(width, height, depth = 1) {
    const image = { width: width, height, depth };
    this.image = image;
  }
}
const omitted = new Dimensions();
const supplied = new Dimensions(2, 3, 4);
console.log(omitted.image.width, omitted.image.height, omitted.image.depth);
console.log(supplied.image.width, supplied.image.height, supplied.image.depth);
console.log(Object.keys(omitted.image).join(','));
supplied.image.width = undefined;
console.log(supplied.image.width, supplied.image.height);
class Nested {
  /** @param {number} value */
  constructor(value) { this.data = { nested: { value: (value) } }; }
}
console.log(new Nested().data.nested.value, new Nested(5).data.nested.value);
