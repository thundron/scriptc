/// <reference path="./three-host.d.ts" />
import { AnimationClip, AnimationMixer, BoxGeometry, DataTexture, Mesh, MeshStandardMaterial, NumberKeyframeTrack, PerspectiveCamera, Scene, Vector3 } from 'three';

const camera = new PerspectiveCamera(70, 1, 0.01, 10);
camera.position.z = 1;
const scene = new Scene();
const geometry = new BoxGeometry(0.2, 0.2, 0.2);
const material = new MeshStandardMaterial({ color: 0x336699, roughness: 0.25, metalness: 0.75 });
const mesh = new Mesh(geometry, material);
scene.add(mesh);
const point = new Vector3();
const mixer = new AnimationMixer(mesh);
const clip = new AnimationClip('move', 2, [new NumberKeyframeTrack('.position[x]', [0, 2], [0, 0.1])]);
mixer.clipAction(clip).play();
const texture = new DataTexture(new Uint8Array([255, 0, 0, 255]), 1, 1);
texture.needsUpdate = true;
texture.addEventListener('dispose', () => resource(0, texture.version, 0));

/** @param {number} time @param {number} aspect @returns {number} */
export function frame(time, aspect) {
  mixer.setTime(time / 1000);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  mesh.rotation.x = time / 2000;
  mesh.rotation.y = time / 1000;
  scene.updateMatrixWorld(true);
  surface(material.color.r, material.color.g, material.color.b, material.roughness, material.metalness);
  resource(0, texture.version, texture.image.width * texture.image.height);
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld).project(camera);
    vertex(i, point.x, point.y, point.z);
  }
  return Number(position.count);
}

/** @returns {number} */
export function dispose() {
  texture.dispose();
  geometry.dispose();
  material.dispose();
  return 0;
}
