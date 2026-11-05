import { MeshNormalMaterial } from 'three/src/materials/MeshNormalMaterial.js';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial.js';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial.js';
import { Plane } from 'three/src/math/Plane.js';
import { Vector3 } from 'three/src/math/Vector3.js';

const normal = new MeshNormalMaterial({wireframe: true, opacity: 0.5, transparent: true});
console.log('normal', normal.type, normal.wireframe, normal.opacity, normal.transparent);
normal.setValues({wireframe: false, opacity: 0.8});
normal.needsUpdate = true;
console.log('updated', normal.wireframe, normal.opacity, normal.version);
const copy = normal.clone();
console.log('clone', copy !== normal, copy.type, copy.opacity, copy.normalScale.x);
copy.normalScale.x = 2;
console.log('independent', normal.normalScale.x, copy.normalScale.x);

const plane = new Plane(new Vector3(1, 0, 0), 2);
normal.setValues({clippingPlanes: [plane], clipIntersection: true});
if (normal.clippingPlanes !== null) {
  console.log('clip', normal.clippingPlanes.length, normal.clippingPlanes[0] === plane, normal.clipIntersection);
  normal.clippingPlanes[0].constant = 3;
}
console.log('plane', plane.constant);
normal.setValues({clippingPlanes: null});
console.log('unclipped', normal.clippingPlanes === null);

const basic = new MeshBasicMaterial({color: 0xff0000});
console.log('red', basic.color.r, basic.color.g, basic.color.b);
basic.setValues({color: 0x0000ff});
console.log('blue', basic.color.r, basic.color.g, basic.color.b);
console.log('basic-copy', basic.clone().color.b);
const standard = new MeshStandardMaterial({roughness: 0.25, metalness: 0.8, color: 0x00ff00});
console.log('standard', standard.type, standard.roughness, standard.metalness, standard.color.g);
console.log('standard-copy', standard.clone().roughness, standard.clone().metalness);

let count = 0;
function disposed(event) {
  count++;
  console.log('event', event.type, event.target === normal, this === normal);
}
normal.addEventListener('dispose', disposed);
normal.dispose();
normal.removeEventListener('dispose', disposed);
normal.dispose();
console.log('events', count);
