import { AnimationMixer, Vector3, FileLoader } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Resource transport belongs to the host. This fixture uses embedded buffers.
FileLoader.prototype.load = function () { throw new Error("external resource host required"); };

// A JSON scene needs no resource host.
const loader = new GLTFLoader();
const simple = await loader.parseAsync(JSON.stringify({
  asset: { version: "2.0" }, scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ name: "hello", translation: [1, 2, 3] }],
}), "");
console.log("gltf", simple.scene.children[0].name, simple.scene.children[0].position.y);

// A self-contained GLB exercises binary buffers, typed accessors, PBR data,
// mesh construction and animation without fetch, DOM images or decoders.
const binary = new ArrayBuffer(76);
new Float32Array(binary, 0, 9).set([0, 0, 0, 1, 0, 0, 0, 1, 0]);
new Uint16Array(binary, 36, 3).set([0, 1, 2]);
new Float32Array(binary, 44, 2).set([0, 1]);
new Float32Array(binary, 52, 6).set([0, 0, 0, 2, 4, 6]);
const document = {
  asset: { version: "2.0" }, scene: 0,
  scenes: [{ name: "model", nodes: [0] }],
  nodes: [{ name: "triangle", mesh: 0, translation: [3, 2, 1] }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] }],
  materials: [{ name: "surface", pbrMetallicRoughness: {
    baseColorFactor: [1, 0.5, 0.25, 1], metallicFactor: 0.75, roughnessFactor: 0.25,
  } }],
  buffers: [{ byteLength: 76 }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
    { buffer: 0, byteOffset: 36, byteLength: 6, target: 34963 },
    { buffer: 0, byteOffset: 44, byteLength: 8 },
    { buffer: 0, byteOffset: 52, byteLength: 24 },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: 3, type: "VEC3", min: [0, 0, 0], max: [1, 1, 0] },
    { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
    { bufferView: 2, componentType: 5126, count: 2, type: "SCALAR", min: [0], max: [1] },
    { bufferView: 3, componentType: 5126, count: 2, type: "VEC3" },
  ],
  animations: [{ name: "move", samplers: [{ input: 2, output: 3, interpolation: "LINEAR" }],
    channels: [{ sampler: 0, target: { node: 0, path: "translation" } }] }],
};
const json = new TextEncoder().encode(JSON.stringify(document));
const jsonLength = Math.ceil(json.length / 4) * 4;
const glb = new ArrayBuffer(12 + 8 + jsonLength + 8 + binary.byteLength);
const header = new DataView(glb);
header.setUint32(0, 0x46546c67, true);
header.setUint32(4, 2, true);
header.setUint32(8, glb.byteLength, true);
header.setUint32(12, jsonLength, true);
header.setUint32(16, 0x4e4f534a, true);
const jsonChunk = new Uint8Array(glb, 20, jsonLength);
jsonChunk.fill(0x20);
jsonChunk.set(json);
header.setUint32(20 + jsonLength, binary.byteLength, true);
header.setUint32(24 + jsonLength, 0x004e4942, true);
new Uint8Array(glb, 28 + jsonLength).set(new Uint8Array(binary));
const model = await loader.parseAsync(glb, "");
const mesh = model.scene.children[0];
console.log("glb", model.scene.name, mesh.name, mesh.type, mesh.geometry.attributes.position.count, mesh.geometry.index.getX(2));
console.log("pbr", mesh.material.name, mesh.material.type, mesh.material.color.g, mesh.material.roughness, mesh.material.metalness);
console.log("accessor", mesh.geometry.attributes.position.getX(1), mesh.geometry.attributes.position.getY(2));
const mixer = new AnimationMixer(model.scene);
const clip = model.animations[0];
const action = mixer.clipAction(clip).play();
mixer.update(0.5);
console.log("animation", model.animations[0].name, model.animations[0].duration, mesh.position.x, mesh.position.y, mesh.position.z);
model.scene.updateMatrixWorld(true);
const vertex = mesh.getVertexPosition(1, new Vector3()).applyMatrix4(mesh.matrixWorld);
console.log("vertex", vertex.x, vertex.y, vertex.z);
mixer.stopAllAction();
mixer.uncacheRoot(model.scene);
mesh.geometry.dispose();
mesh.material.dispose();
