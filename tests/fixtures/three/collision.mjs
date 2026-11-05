import { Vector3, Triangle, Sphere, Ray } from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { Octree } from 'three/addons/math/Octree.js';

const round = n => Math.round(n * 1000000);
const tree = new Octree();
tree.trianglesPerLeaf = 2;
for (let x = -4; x < 4; x++) {
  for (let z = -4; z < 4; z++) {
    tree.addTriangle(new Triangle(new Vector3(x,0,z),new Vector3(x,0,z+1),new Vector3(x+1,0,z)));
    tree.addTriangle(new Triangle(new Vector3(x+1,0,z),new Vector3(x,0,z+1),new Vector3(x+1,0,z+1)));
  }
}
tree.build();
const body = new Capsule(new Vector3(0.1,0.2,0.1),new Vector3(0.1,1.3,0.1),0.35);
const candidates = [];
tree.getCapsuleTriangles(body,candidates);
console.log('candidates', candidates.length, new Set(candidates).size);
const hit = tree.capsuleIntersect(body);
if (hit) console.log('capsule',round(hit.depth),round(hit.normal.y),round(body.start.y));
else console.log('capsule miss');
body.translate(new Vector3(0,3,0));
console.log('capsule miss',tree.capsuleIntersect(body) === false);
const sphere = tree.sphereIntersect(new Sphere(new Vector3(0.1,0.2,0.1),0.4));
if(sphere) console.log('sphere',round(sphere.depth),round(sphere.normal.y));
else console.log('sphere miss');
const ray = tree.rayIntersect(new Ray(new Vector3(0.2,4,0.3),new Vector3(0,-1,0)));
if(ray) console.log('ray',round(ray.distance),round(ray.position.x),round(ray.position.y));
else console.log('ray miss');
console.log('ray miss',tree.rayIntersect(new Ray(new Vector3(8,4,8),new Vector3(0,-1,0))) === false);
const a = new Vector3(0,0,0), b = new Vector3(0,0,1), c = new Vector3(1,0,0);
console.log('inside', Triangle.containsPoint(new Vector3(0.2,0.1,0.2),a,b,c));
console.log('outside', Triangle.containsPoint(new Vector3(2,0,2),a,b,c));
console.log('degenerate', Triangle.containsPoint(new Vector3(),a,a,a));
