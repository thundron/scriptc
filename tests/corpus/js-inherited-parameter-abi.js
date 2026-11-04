class Base {
  /** @param {boolean} [force] */
  update(force) { console.log('base', force === undefined, force === true); }
  forward(force) { this.update(force); }
}
class Child extends Base {
  update(force) { console.log('child', force === undefined, force === false); super.update(force); }
}
const base = new Base(), child = new Child();
base.update(); child.update(); child.update(false); child.forward(true);
class Defaults {
  run(value = 5) { console.log('default', value); }
}
class NoDefault extends Defaults {
  run(value) { console.log('no default', value === undefined); }
}
new Defaults().run(); new NoDefault().run(); new NoDefault().run(3);
