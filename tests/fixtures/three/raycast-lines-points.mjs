import { Line } from 'three/src/objects/Line.js';
import { LineSegments } from 'three/src/objects/LineSegments.js';
import { LineLoop } from 'three/src/objects/LineLoop.js';
import { Points } from 'three/src/objects/Points.js';
import { BufferGeometry } from 'three/src/core/BufferGeometry.js';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute.js';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial.js';
import { PointsMaterial } from 'three/src/materials/PointsMaterial.js';
import { Raycaster } from 'three/src/core/Raycaster.js';
import { Vector3 } from 'three/src/math/Vector3.js';
const geometry = new BufferGeometry();
geometry.setAttribute('position',new Float32BufferAttribute([-1,0,-5,1,0,-5,1,2,-5,-1,2,-5],3));
const ray = new Raycaster(new Vector3(0,0.1,0),new Vector3(0,0,-1));
ray.params.Line.threshold = 0.2;
for (const line of [new Line(geometry,new LineBasicMaterial()), new LineSegments(geometry,new LineBasicMaterial()), new LineLoop(geometry,new LineBasicMaterial())]) {
  line.updateMatrixWorld();
  const hit = ray.intersectObject(line);
  console.log('line', line.type, hit.length, hit[0].distance, hit[0].index, hit[0].point.x, hit[0].point.y, hit[0].object === line);
}
const pg = new BufferGeometry(); pg.setAttribute('position',new Float32BufferAttribute([0,0,-5,1,0,-5,0,0,-3],3));
const points = new Points(pg,new PointsMaterial()); points.updateMatrixWorld();
ray.params.Points.threshold = 0.2;
const hits = ray.intersectObject(points);
console.log('points', hits.length, hits[0].distance, hits[1].distance, Number(hits[0].distanceToRay).toFixed(4), hits[0].index, hits[0].object === points);
ray.params.Points.threshold = 0.05;
console.log('threshold', ray.intersectObject(points).length);
pg.setIndex([0,1]); ray.params.Points.threshold = 0.2;
console.log('indexed', ray.intersectObject(points).length);
