import { BoxGeometry, BufferGeometryLoader, Cache, LoaderUtils, LoadingManager, MaterialLoader, Mesh, MeshBasicMaterial, MeshStandardMaterial, ObjectLoader, PerspectiveCamera, Scene } from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// loader-material
{
    const m = new MeshStandardMaterial({ color: 0xff0000, roughness: 0.25, metalness: 0.8 });
    const copy = new MaterialLoader().parse(m.toJSON());
    console.log('material', copy.type, copy.color.getHexString(), copy.roughness, copy.metalness);
}

// loader-buffer-geometry
{
    const g = new BoxGeometry().toNonIndexed();
    const json = g.toJSON();
    const copy = new BufferGeometryLoader().parse(json);
    console.log('geometry', copy.type, copy.attributes.position.count, copy.attributes.position.array.constructor === Float32Array);
}

// scene-serialization
{
    const scene = new Scene();
    const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color: 0xff0000 }));
    mesh.name = 'box';
    mesh.userData = { hello: 'world' };
    scene.add(mesh);
    const json = scene.toJSON();
    console.log('json', json.object.type, json.geometries.length, json.materials.length);
    const copy = new ObjectLoader().parse(json);
    console.log('loaded', copy.type, copy.children[0].geometry.type, copy.children[0].material.color.getHexString(), copy.children[0].userData.hello);
}

// loader-obj
{
    const result = new OBJLoader().parse(`v 0 0 0
v 1 0 0
v 0 1 0
f 1 2 3
`);
    console.log('obj', result.type, result.children.length, result.children[0].geometry.attributes.position.count);
}

// loader-stl
{
    const input = `solid test
facet normal 0 0 1
outer loop
vertex 0 0 0
vertex 1 0 0
vertex 0 1 0
endloop
endfacet
endsolid test`;
    const g = new STLLoader().parse(input);
    console.log('stl', g.attributes.position.count, g.attributes.normal.getZ(0));
}

// loader-ply
{
    const input = `ply
format ascii 1.0
element vertex 3
property float x
property float y
property float z
element face 1
property list uchar int vertex_indices
end_header
0 0 0
1 0 0
0 1 0
3 0 1 2
`;
    const g = new PLYLoader().parse(input);
    console.log('ply', g.attributes.position.count, g.index.count);
}

// loader-manager
{
    const events = [];
    const manager = new LoadingManager(() => events.push('done'), (url, loaded, total) => events.push(loaded + '/' + total));
    manager.setURLModifier(url => 'prefix/' + url);
    console.log('url', manager.resolveURL('model.glb'));
    manager.itemStart('one');
    manager.itemEnd('one');
    console.log('events', events.join(','));
    Cache.enabled = true;
    Cache.add('hello', { value: 3 });
    console.log('cache', Cache.get('hello').value);
    Cache.remove('hello');
    console.log('remove', Cache.get('hello') === undefined);
    console.log('path', LoaderUtils.extractUrlBase('/models/a.glb'));
}

// controls-orbit-headless
{
    const camera = new PerspectiveCamera();
    camera.position.set(0, 0, 5);
    const controls = new OrbitControls(camera);
    controls.target.set(1, 0, 0);
    controls.update();
    console.log('orbit', controls.target.x, camera.position.z, controls.getDistance().toFixed(3));
}
