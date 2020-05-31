import * as THREE from './build/three.module.js';

import * as global from './main.js';
import { getY } from './utils.js';
import { exportGLTF } from './export.js';

var grassGeometry, sandGeometry, waterGeometry, grassMesh, sandMesh, waterMesh, h, transform2, scene_download;

grassGeometry = new THREE.Geometry();
sandGeometry = new THREE.Geometry();
waterGeometry = new THREE.Geometry();
transform2 = new THREE.Object3D();

scene_download = new THREE.Scene();

function download() {

  for (var z = 0; z < global.worldDepth; z++) {

    for (var x = 0; x < global.worldWidth; x++) {

      h = getY(x, z);

      transform2.position.set(x * 1 - global.worldWidth / 2 * 1, h * 1, z * 1 - global.worldDepth / 2 * 1);
      transform2.updateMatrix();

      if (h >= global.terrain.sandLevel) {
        transform2.updateMatrix();
        grassGeometry.merge(global.terrain.grassGeometry, transform2.matrix);

      } else
      if ((h < global.terrain.sandLevel) && (h > global.terrain.waterLevel)) {
        transform2.updateMatrix();
        sandGeometry.merge(global.terrain.sandGeometry, transform2.matrix);

      } else
      if (h <= global.terrain.waterLevel) {
        transform2.position.set(x * 1 - global.worldWidth / 2 * 1, global.terrain.waterLevel, z * 1 - global.worldDepth / 2 * 1);
        transform2.updateMatrix();
        waterGeometry.merge(global.terrain.waterGeometry, transform2.matrix);
      }
    }
  }

  let grassGeometryBuffer = new THREE.BufferGeometry().fromGeometry(grassGeometry); // buffer geometry reduces file sizes
  let sandGeometryBuffer = new THREE.BufferGeometry().fromGeometry(sandGeometry);
  let waterGeometryBuffer = new THREE.BufferGeometry().fromGeometry(waterGeometry);

  grassMesh = new THREE.Mesh(grassGeometryBuffer, new THREE.MeshStandardMaterial({ color: global.terrain.grass_color }));
  sandMesh = new THREE.Mesh(sandGeometryBuffer, new THREE.MeshStandardMaterial({ color: global.terrain.sand_color }));
  waterMesh = new THREE.Mesh(waterGeometryBuffer, new THREE.MeshStandardMaterial({ color: global.terrain.water_color }));
  
  scene_download.add(grassMesh);
  scene_download.add(sandMesh);
  scene_download.add(waterMesh);

  exportGLTF(scene_download);

}


export { download };