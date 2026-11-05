import { Vector2 } from 'three/src/math/Vector2.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { Quaternion } from 'three/src/math/Quaternion.js';
import { Matrix4 } from 'three/src/math/Matrix4.js';
import { setQuaternionFromProperEuler } from 'three/src/math/MathUtils.js';

const point = new Vector3(1, 2, 3);
const translation = new Matrix4().makeTranslation(4, 5, 6);
point.applyMatrix4(translation);
console.log('translation', point.x, point.y, point.z, translation.isMatrix4);
const fromVector = new Matrix4().makeTranslation(new Vector3(2, 3, 4));
point.applyMatrix4(fromVector);
console.log('vector overload', point.x, point.y, point.z);
point.applyMatrix4(fromVector.clone().invert());
console.log('inverse', point.x, point.y, point.z);

const quaternion = new Quaternion();
setQuaternionFromProperEuler(quaternion, 0, 0, 0, 'XYX');
console.log('quaternion', quaternion.x, quaternion.y, quaternion.z, quaternion.w);
const composed = new Matrix4().compose(new Vector3(3, 4, 5), quaternion, new Vector3(2, 3, 4));
const transformed = new Vector3(1, 2, 3).applyMatrix4(composed);
console.log('compose', transformed.x, transformed.y, transformed.z);

const planar = new Vector2(3, 4);
console.log('vector2', planar.length(), planar.isVector2);
planar.add(new Vector2(1, 2)).multiplyScalar(2);
console.log('arithmetic', planar.x, planar.y);
const normal = new Vector3(1, 0, 0).cross(new Vector3(0, 1, 0));
console.log('cross', normal.x, normal.y, normal.z, normal.isVector3);
console.log('dot', normal.dot(new Vector3(2, 3, 4)));
try { planar.getComponent(3); } catch (error) { console.log(error.name, error.message); }
