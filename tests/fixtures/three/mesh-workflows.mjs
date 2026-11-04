import { BatchedMesh, Bone, Box3, BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, InstancedMesh, LOD, Matrix3, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Ray, Raycaster, Skeleton, SkinnedMesh, Sprite, SpriteMaterial, Triangle, Uint16BufferAttribute, Vector3 } from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { OBB } from "three/addons/math/OBB.js";

// instancing
{
    const mesh = new InstancedMesh(new BoxGeometry(), new MeshBasicMaterial(), 2);
    mesh.setMatrixAt(0, new Matrix4().makeTranslation(0, 0, -3));
    mesh.setMatrixAt(1, new Matrix4().makeTranslation(2, 0, -3));
    mesh.setColorAt(0, new Color(0xff0000));
    mesh.setColorAt(1, new Color(0x00ff00));
    const c = new Color();
    mesh.getColorAt(1, c);
    mesh.computeBoundingSphere();
    mesh.updateMatrixWorld();
    console.log('instance', c.g, mesh.boundingSphere.radius.toFixed(4));
    const hits = new Raycaster(new Vector3(0.1, 0.1, 0), new Vector3(0, 0, -1)).intersectObject(mesh);
    console.log('hit', hits.length, hits[0].instanceId, hits[0].object === mesh);
}

// batched-mesh
{
    const batch = new BatchedMesh(4, 100, 200, new MeshBasicMaterial());
    const id = batch.addGeometry(new BoxGeometry());
    const instance = batch.addInstance(id);
    batch.setMatrixAt(instance, new Matrix4().makeTranslation(1, 2, 3));
    batch.setColorAt(instance, new Color(0xff0000));
    const m = new Matrix4();
    batch.getMatrixAt(instance, m);
    console.log('batch', instance, m.elements[12], batch.getVisibleAt(instance), batch.instanceCount);
}

// lod-sprite
{
    const lod = new LOD(), a = new Mesh(new BoxGeometry(), new MeshBasicMaterial()), b = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
    lod.addLevel(a, 0).addLevel(b, 5);
    const camera = new PerspectiveCamera();
    camera.position.z = 10;
    camera.updateMatrixWorld();
    lod.update(camera);
    console.log('lod', lod.getCurrentLevel(), a.visible, b.visible, lod.getObjectForDistance(2) === a);
    const sprite = new Sprite(new SpriteMaterial());
    sprite.position.z = -3;
    sprite.updateMatrixWorld();
    const ray = new Raycaster(new Vector3(), new Vector3(0, 0, -1));
    ray.camera = camera;
    console.log('sprite', ray.intersectObject(sprite).length);
}

// morph-targets
{
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
    g.morphAttributes.position = [new Float32BufferAttribute([0, 0, 1, 1, 0, 1, 0, 1, 1], 3)];
    const mesh = new Mesh(g, new MeshBasicMaterial());
    mesh.morphTargetInfluences[0] = 0.5;
    console.log('morph', mesh.morphTargetInfluences.length, mesh.getVertexPosition(0, new Vector3()).z);
    g.computeBoundingBox();
    console.log('bounds', g.boundingBox.max.z);
}

// skeleton-skinning
{
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
    g.setAttribute('skinIndex', new Uint16BufferAttribute([0, 0, 0, 0], 4));
    g.setAttribute('skinWeight', new Float32BufferAttribute([1, 0, 0, 0], 4));
    const bone = new Bone(), skeleton = new Skeleton([bone]);
    const mesh = new SkinnedMesh(g, new MeshBasicMaterial());
    mesh.add(bone);
    mesh.bind(skeleton, new Matrix4());
    bone.position.y = 2;
    mesh.updateMatrixWorld(true);
    skeleton.update();
    console.log('skin', mesh.getVertexPosition(0, new Vector3()).y, skeleton.boneMatrices[13], skeleton.clone().bones.length);
    mesh.normalizeSkinWeights();
    console.log('weight', g.attributes.skinWeight.getX(0));
}

// skeleton-utils
{
    const root = new Bone(), child = new Bone();
    root.add(child);
    const mesh = new SkinnedMesh(new BoxGeometry(), new MeshBasicMaterial());
    mesh.add(root);
    mesh.bind(new Skeleton([root, child]));
    const copy = clone(mesh);
    console.log('clone', copy !== mesh, copy.skeleton !== mesh.skeleton, copy.skeleton.bones[0] !== root, copy.skeleton.bones[0] === copy.children[0]);
}

// mesh-attribute-missing-w
{
    const a = new Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1], 3);
    const v = Triangle.getInterpolatedAttribute(a, 0, 1, 2, new Vector3(0.5, 0.25, 0.25), new Vector3());
    console.log(v.x, v.y, v.z);
}

// collision-obb
{
    const a = new OBB(new Vector3(), new Vector3(1, 1, 1), new Matrix3());
    const b = new OBB(new Vector3(1, 0, 0), new Vector3(1, 1, 1), new Matrix3());
    console.log('obb', a.intersectsOBB(b), a.containsPoint(new Vector3(0.5, 0, 0)));
    b.center.x = 5;
    console.log('miss', a.intersectsOBB(b));
    console.log('ray', a.intersectRay(new Ray(new Vector3(0, 0, 5), new Vector3(0, 0, -1)), new Vector3()).z);
}
