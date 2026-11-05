import { Vector3, Mesh, BoxGeometry, MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, float, vec3, uniform, add, mix, sin, uv } from 'three/tsl';

const sum = add(float(2), float(3));
const scalar = uniform(4);
const vector = vec3(1, 2, 3);
console.log('nodes', sum.isNode, scalar.value, vector.isNode);
scalar.value = 7;
console.log('uniform', scalar.value, sin(scalar).isNode, mix(vector, vec3(0), float(0.5)).isNode);

const twice = Fn(([value]) => value.mul(2).add(1)).setLayout({ name: 'twice', type: 'float', inputs: [{ name: 'value', type: 'float' }] });
console.log('function', typeof twice, twice.isNode, twice(float(3)).isNode);
const material = new MeshBasicNodeMaterial();
material.colorNode = vector;
material.opacityNode = scalar;
const mesh = new Mesh(new BoxGeometry(), material);
mesh.position.copy(new Vector3(1, 2, 3));
console.log('webgpu data', mesh.type, mesh.position.lengthSq(), material.type, material.colorNode.isNode, material.opacityNode.value, uv().isNode);
