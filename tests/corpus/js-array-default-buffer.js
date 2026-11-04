class Vector {
  /** @param {number[]} [target] @param {number} [offset] */
  write(target = [], offset = 0) {
    target[offset] = 1;
    target[offset + 1] = 2;
    target[offset + 2] = 3;
    return target;
  }
}
const vector = new Vector();
const typed = new Float64Array(4);
console.log(vector.write(typed, 1) === typed, typed.join(','));
const ordinary = [9];
console.log(vector.write(ordinary) === ordinary, ordinary.join(','), vector.write().join(','));
const detached = vector.write;
console.log(detached.call(vector, typed) === typed, typed.join(','));
