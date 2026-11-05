function render(...values: number[]): void {
  console.log(values.length, values[0], values[1]);
}
const values = [42];
render(values[4]);
render(1, values[5]);
render();
class Base {
  render(...values: number[]): void { console.log('base', values.length, values[0], values[1]); }
}
class Child extends Base {
  render(...values: number[]): void { console.log('child', values.length, values[0], values[1]); }
}
function call(base: Base): void {
  base.render(values[4]);
  base.render(1, values[5]);
  base.render();
}
call(new Base());
call(new Child());
