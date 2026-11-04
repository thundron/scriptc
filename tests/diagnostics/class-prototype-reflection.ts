class Vector {
  x = 0;
  length(): number { return this.x; }
}
// Named slots are represented; bare prototype reflection is not.
const prototype = Vector.prototype;
Object.getOwnPropertyDescriptors(Vector.prototype);
// End of the prototype reflection diagnostic fixture.
