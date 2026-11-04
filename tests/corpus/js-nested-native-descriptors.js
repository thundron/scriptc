class Position { constructor(x) { this.x = x; } }
class Scene {
  constructor(value) {
    Object.defineProperties(this, {
      position: { value, enumerable: true, configurable: true },
      hidden: { value: new Position(3) },
    });
  }
}
const position = new Position(1);
const scene = new Scene(position);
console.log(scene.position === position, scene.hidden.x, Object.keys(scene).join(','));
position.x = 2;
console.log(scene.position.x);
const descriptor = Object.getOwnPropertyDescriptor(scene, 'position');
console.log(descriptor.value === position, descriptor.writable, descriptor.enumerable, descriptor.configurable);
// @ts-expect-error JavaScript typeof permits an unresolvable reference.
console.log(typeof scriptcMissingHostGlobal, typeof (scriptcMissingHostGlobal));
