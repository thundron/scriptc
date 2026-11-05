import { BoxGeometry, BufferGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, DodecahedronGeometry, Float16BufferAttribute, Float32BufferAttribute, IcosahedronGeometry, InstancedBufferAttribute, InstancedInterleavedBuffer, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, OctahedronGeometry, PlaneGeometry, RingGeometry, SphereGeometry, TetrahedronGeometry, TorusGeometry, TorusKnotGeometry, Vector3 } from "three";
import { computeMorphedAttributes, mergeGeometries, mergeVertices, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// primitive-geometries
{
    for (const g of [new SphereGeometry(1, 8, 4), new PlaneGeometry(2, 3, 2, 2), new CircleGeometry(1, 8), new CylinderGeometry(1, 1, 2, 8), new ConeGeometry(1, 2, 8), new TorusGeometry(1, 0.2, 4, 8), new TorusKnotGeometry(1, 0.2, 16, 4), new RingGeometry(0.5, 1, 8), new DodecahedronGeometry(), new IcosahedronGeometry(), new OctahedronGeometry(), new TetrahedronGeometry()]) {
        g.computeBoundingBox();
        console.log(g.type, g.attributes.position.count, g.index === null ? 0 : g.index.count, g.boundingBox.getSize(new Vector3()).x.toFixed(3));
    }
}

// geometry-processing
{
    const box = new BoxGeometry();
    const non = box.toNonIndexed();
    non.computeVertexNormals();
    non.computeBoundingSphere();
    console.log('nonindexed', non.index === null, non.attributes.position.count, non.boundingSphere.radius.toFixed(4));
    box.computeTangents();
    console.log('tangent', box.attributes.tangent.itemSize, box.attributes.tangent.getW(0));
    const copy = box.clone();
    copy.attributes.position.setX(0, 7);
    console.log('copy', box.attributes.position.getX(0), copy.attributes.position.getX(0));
    const points = new BufferGeometry().setFromPoints([new Vector3(), new Vector3(1, 2, 3)]);
    console.log('points', points.attributes.position.count);
}

// geometry-utils
{
    const g = mergeGeometries([new BoxGeometry(), new BoxGeometry().translate(2, 0, 0)], true);
    console.log('merge', g.attributes.position.count, g.groups.length, mergeVertices(g).attributes.position.count);
    console.log('crease', toCreasedNormals(new BoxGeometry(), Math.PI / 3).attributes.normal.count);
}

// convex-parametric
{
    const points = [new Vector3(), new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
    console.log('convex', new ConvexGeometry(points).attributes.position.count);
    const g = new ParametricGeometry((u, v, target) => target.set(u, v, u * v), 2, 2);
    console.log('parametric', g.attributes.position.count, g.index.count);
    console.log('rounded', new RoundedBoxGeometry(1, 1, 1, 1, 0.1).attributes.position.count);
}

// interleaved-attributes
{
    const data = new InterleavedBuffer(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]), 4);
    const position = new InterleavedBufferAttribute(data, 3, 0);
    position.setXYZ(1, 8, 9, 10);
    position.applyMatrix4(new Matrix4().makeTranslation(1, 2, 3));
    console.log('interleaved', position.count, position.getX(1), position.getY(1), data.array[7]);
    console.log('instance', new InstancedBufferAttribute(new Float32Array([1, 2]), 1, false, 2).meshPerAttribute, new InstancedInterleavedBuffer(new Float32Array([1, 2]), 2, 3).meshPerAttribute);
    const half = new Float16BufferAttribute([0, 0, 0], 3);
    half.setXYZ(0, 1.5, -2, 0.25);
    console.log('half', half.getX(0), half.getY(0), half.getZ(0));
}
