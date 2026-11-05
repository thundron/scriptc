import { Vector3, Quaternion } from 'three';
import * as THREE from 'three';
const point = new Vector3(1, 2, 3);
console.log('named', point.x, point.y, point.z);
console.log('namespace', new THREE.Vector3(4, 5, 6).lengthSq());
console.log('identity', THREE.Vector3 === Vector3, THREE.Quaternion === Quaternion);
console.log('static', THREE.Object3D.DEFAULT_UP.y);
