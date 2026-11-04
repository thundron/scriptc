class Vector { constructor(x = 0) { this.x = x; } dot(other) { return this.x * other.x; } }
class Plane { constructor() { this.normal = new Vector(2); } }
class Ray {
  constructor() { this.direction = new Vector(3); }
  distance(plane) { return plane.normal.dot(this.direction); }
}
const ray = new Ray();
console.log(ray.distance(new Plane()));
