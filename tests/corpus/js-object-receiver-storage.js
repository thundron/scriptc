function registry() {
  const object = {
    entries: {},
    add(values) { Object.assign(this.entries, values); },
    get(key) { return object.entries[key]; },
  };
  object.add({ first: 3 });
  return object;
}
const object = registry();
object.add({ second: 7 });
console.log(object.get("first"), object.get("second"), object.get("missing"));
class NumericField {
  constructor() { this.value = 1; }
  read(array, index) { this.value = array[index]; return this; }
  add(number) { this.value += number; return this.value; }
}
const numeric = new NumericField().read([2], 1);
console.log(numeric.value, Number.isNaN(numeric.add(3)));
/** @returns {number|null} */
function documented(flag) { if (flag) return 5; }
console.log(documented(true), documented(false));
function findLast(flags) {
  let found;
  for (const flag of flags) found = documented(flag);
  return found;
}
console.log(findLast([true, false]));
