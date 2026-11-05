function createLayout() {
  return { columns: [], offsets: [0], packed: new Int32Array([0, 2]), width: 0 };
}
const factory = () => ({ packed: new Float64Array([1.5, 2.5]), size: 2 });
class Layout {
  layout = this.createEmptyLayout();
  createEmptyLayout() { return createLayout(); }
}
const layout = new Layout();
layout.layout.packed[0] = 7;
layout.layout.offsets[0] = 3;
console.log(layout.layout.packed[0], layout.layout.offsets[0], layout.layout.width);
const result = factory();
const alias = result;
alias.packed[1] = 4.5;
console.log(result === alias, result.packed[1], result.size);
const first = createLayout();
const second = createLayout();
first.packed[0] = 8;
console.log(first === second, first.packed === second.packed, second.packed[0]);
const expected = { label: "same" };
function wrapper() { return expected; }
function identity(value) { return value; }
console.log(wrapper() === expected, identity(wrapper()) === expected);
