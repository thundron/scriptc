import { BoxGeometry, InstancedMesh, InterpolateDiscrete, Matrix4, MeshBasicMaterial, NumberKeyframeTrack, Vector3 } from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const first = new BoxGeometry(1, 1, 1);
const second = new BoxGeometry(1, 1, 1).translate(2, 0, 0);
const merged = mergeGeometries([first, second]);
const welded = mergeVertices(merged);
console.log(merged.getAttribute('position').count, welded.getAttribute('position').count);
console.log(welded.getAttribute('position').array.constructor === Float32Array);
console.log(welded.index.array.constructor === Uint16Array, welded.index.count);
console.log(welded.getAttribute('position').getX(24));

const instances = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial(), 3);
const transform = new Matrix4();
for (let i = 0; i < 3; i++) instances.setMatrixAt(i, transform.makeTranslation(i * 2, 0, 0));
instances.computeBoundingBox();
console.log(instances.boundingBox.getSize(new Vector3()).x, instances.instanceMatrix.array[28]);
instances.getMatrixAt(2, transform);
console.log(transform.elements[12]);

const track = new NumberKeyframeTrack('.position[x]', [0, 1], [0, 10]);
const interpolant = track.createInterpolant();
console.log(track.times.constructor === Float32Array, track.values.constructor === Float32Array);
console.log(interpolant.evaluate(0.25)[0], interpolant.evaluate(0.75)[0]);
track.setInterpolation(InterpolateDiscrete);
console.log(track.createInterpolant().evaluate(0.5)[0]);
