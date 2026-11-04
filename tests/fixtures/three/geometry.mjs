import { BoxGeometry } from 'three/src/geometries/BoxGeometry.js';
import { BufferGeometry } from 'three/src/core/BufferGeometry.js';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute.js';
import { Matrix4 } from 'three/src/math/Matrix4.js';
import { Vector3 } from 'three/src/math/Vector3.js';

const box = new BoxGeometry(2, 4, 6);
console.log('box', box.type, box.attributes.position.count, box.index.count, box.groups.length);
box.computeBoundingBox();
box.computeBoundingSphere();
console.log('bounds', box.boundingBox.min.x, box.boundingBox.min.y, box.boundingBox.min.z,
  box.boundingBox.max.x, box.boundingBox.max.y, box.boundingBox.max.z, box.boundingSphere.radius.toFixed(4));
box.translate(1, 2, 3);
console.log('translated', box.boundingBox.min.x, box.boundingBox.min.y, box.boundingBox.min.z);
const dense = new BoxGeometry(1, 1, 1, 2, 3, 4);
console.log('segments', dense.attributes.position.count, dense.index.count, dense.groups[5].materialIndex);

const geometry = new BufferGeometry();
geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 2, 0, 0, 0, 2, 0], 3));
geometry.computeBoundingBox();
geometry.computeBoundingSphere();
geometry.computeVertexNormals();
console.log('triangle', geometry.attributes.position.count, geometry.attributes.normal.getZ(0));
console.log('sphere', geometry.boundingSphere.center.x, geometry.boundingSphere.center.y, geometry.boundingSphere.radius.toFixed(4));
geometry.applyMatrix4(new Matrix4().makeScale(2, 3, 4));
console.log('scaled', geometry.boundingBox.max.x, geometry.boundingBox.max.y, geometry.attributes.normal.getZ(1));
geometry.setIndex([0, 1, 2]);
console.log('index16', geometry.index.array instanceof Uint16Array, geometry.index.getX(2));
geometry.setIndex([0, 65536, 2]);
console.log('index32', geometry.index.array instanceof Uint32Array, geometry.index.getX(1));
geometry.addGroup(0, 3, 2);
geometry.setDrawRange(1, 2);
console.log('draw', geometry.groups[0].materialIndex, geometry.drawRange.start, geometry.drawRange.count);
geometry.clearGroups();
geometry.deleteAttribute('normal');
console.log('removed', geometry.groups.length, geometry.hasAttribute('normal'));
const point = new Vector3(1, 2, 3), copy = point.clone();
copy.x = 4;
console.log('clone', copy !== point, point.x, copy.x, copy.y, copy.z);
