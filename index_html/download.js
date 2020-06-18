import * as THREE from './build/three.module.js';

import * as global from './main.js';
import { getY } from './utils.js';
import { exportGLTF } from './export.js';

var grassGeometry, sandGeometry, waterGeometry, grassMesh, sandMesh, waterMesh, h, transform2, scene_download;


scene_download = new THREE.Scene();

function download() {
  
  grassGeometry = new THREE.Geometry();
  sandGeometry = new THREE.Geometry();
  waterGeometry = new THREE.Geometry();
  transform2 = new THREE.Object3D();

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

  grassMesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(grassGeometry), new THREE.MeshStandardMaterial({ color: global.terrain.grass_color }));
  sandMesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(sandGeometry), new THREE.MeshStandardMaterial({ color: global.terrain.sand_color }));
  waterMesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(waterGeometry), new THREE.MeshStandardMaterial({ color: global.terrain.water_color }));
  
  scene_download.add(grassMesh);
  scene_download.add(sandMesh);
  scene_download.add(waterMesh);

  exportGLTF(scene_download);

  while (scene_download.children.length > 0) {
    scene_download.remove(scene_download.children[0]); 
  }

  grassMesh.geometry.dispose();
  grassMesh.material.dispose();
  sandMesh.geometry.dispose();
  sandMesh.material.dispose();
  waterMesh.geometry.dispose();
  waterMesh.material.dispose();

  grassGeometry.dispose();
  sandGeometry.dispose();
  waterGeometry.dispose();

  scene_download.remove(grassMesh);
  scene_download.remove(sandMesh);
  scene_download.remove(waterMesh);

  scene_download.dispose();

  THREE.Cache.clear();
  console.log('disposed');

}


export { download };