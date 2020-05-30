import * as THREE from './build/three.module.js';

import * as global from './main.js';


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var instanceMatrix = new THREE.Matrix4();
var matrix = new THREE.Matrix4();
var rotationMatrix = new THREE.Matrix4().setPosition(0.2);

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseClick, false);

function onMouseMove() {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick() {
  if (global.VoxelDestruction) {
    raycaster.setFromCamera(mouse, global.camera);

    // console.log(camera.position.y, camera.position.x, camera.position.z);

    var intersection = raycaster.intersectObject(global.grassMesh);
    var intersection2 = raycaster.intersectObject(global.sandMesh);

    if ((intersection.length > 0) && !(intersection2.length > 0)) {   // inefficient way of checking for intersections and 'destroying' relevant block

      var instanceId = intersection[0].instanceId;

      global.grassMesh.getMatrixAt(instanceId, instanceMatrix);
      matrix.multiplyMatrices(instanceMatrix, rotationMatrix);

      global.grassMesh.setMatrixAt(instanceId, matrix);
      global.grassMesh.instanceMatrix.needsUpdate = true;

    } else if ((intersection2.length > 0) && !(intersection.length > 0)) {

      var instanceId = intersection2[0].instanceId;

      global.sandMesh.getMatrixAt(instanceId, instanceMatrix);
      matrix.multiplyMatrices(instanceMatrix, rotationMatrix);

      global.sandMesh.setMatrixAt(instanceId, matrix);
      global.sandMesh.instanceMatrix.needsUpdate = true;

    }
    else if ((intersection.length > 0) && (intersection2.length > 0)) {

      if (intersection[0].distance < intersection2[0].distance) {
        var instanceId = intersection[0].instanceId;

        global.grassMesh.getMatrixAt(instanceId, instanceMatrix);
        matrix.multiplyMatrices(instanceMatrix, rotationMatrix);

        global.grassMesh.setMatrixAt(instanceId, matrix);
        global.grassMesh.instanceMatrix.needsUpdate = true;

      } else {

        var instanceId = intersection2[0].instanceId;

        global.sandMesh.getMatrixAt(instanceId, instanceMatrix);
        matrix.multiplyMatrices(instanceMatrix, rotationMatrix);

        global.sandMesh.setMatrixAt(instanceId, matrix);
        global.sandMesh.instanceMatrix.needsUpdate = true;
      }
    }
  }
}