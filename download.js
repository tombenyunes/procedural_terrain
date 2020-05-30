import * as THREE from './build/three.module.js';

import * as global from './main.js';
import { getY, blocksSubmerged } from './utils.js';
import { exportGLTF } from './export.js';

var grassMeshes, sandMeshes, waterMeshes, grassGeometry, sandGeometry, waterGeometry, grassMesh, sandMesh, waterMesh;
grassMeshes = sandMeshes = waterMeshes = [];


function download() {

  var scene_download = new THREE.Scene();

  grassGeometry = new THREE.Geometry();
  sandGeometry = new THREE.Geometry();
  waterGeometry = new THREE.Geometry();

  let index2 = 0;
  let transform2 = new THREE.Object3D();

  for (var z = 0; z < global.worldDepth; z++) {

    for (var x = 0; x < global.worldWidth; x++) {

      var h = getY(x, z);

      transform2.position.set(x * 1 - global.worldWidth / 2 * 1, h * 1, z * 1 - global.worldDepth / 2 * 1);
      transform2.updateMatrix();

      if (h >= global.terrain.sandLevel) {
        grassMeshes.push(new THREE.Mesh(global.terrain.grassGeometry, new THREE.MeshStandardMaterial({ color: global.terrain.grass_color })));
        grassMeshes[index2].position.set(x * 1 - global.worldWidth / 2 * 1, h * 1, z * 1 - global.worldDepth / 2 * 1);
        transform2.updateMatrix();
        grassGeometry.merge(global.terrain.grassGeometry, transform2.matrix);

      } else
      if ((h < global.terrain.sandLevel) && (h > global.terrain.waterLevel)) {
        sandMeshes.push(new THREE.Mesh(global.terrain.sandGeometry, new THREE.MeshStandardMaterial({ color: global.terrain.sand_color })));
        sandMeshes[index2].position.set(x * 1 - global.worldWidth / 2 * 1, h * 1, z * 1 - global.worldDepth / 2 * 1);
        transform2.updateMatrix();
        sandGeometry.merge(global.terrain.sandGeometry, transform2.matrix);

      } else
      if (h <= global.terrain.waterLevel) {
        waterMeshes.push(new THREE.Mesh(global.terrain.waterGeometry, new THREE.MeshStandardMaterial({ color: global.terrain.water_color })));
        waterMeshes[index2].position.set(x * 1 - global.worldWidth / 2 * 1, h * 1, z * 1 - global.worldDepth / 2 * 1);
        transform2.position.set(x * 1 - global.worldWidth / 2 * 1, global.terrain.waterLevel, z * 1 - global.worldDepth / 2 * 1);
        transform2.updateMatrix();
        waterGeometry.merge(global.terrain.waterGeometry, transform2.matrix);
      }

      index2++;
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