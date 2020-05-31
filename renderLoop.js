import * as THREE from './build/three.module.js';

import * as global from './main.js';


var clock = new THREE.Clock();


function render() {

	var time = performance.now() * 0.001;
	global.water.material.uniforms['time'].value += 1.0 / 60.0;

	requestAnimationFrame(render);

	// stats.update();
	global.controls.update(clock.getDelta());
	global.renderer.render(global.scene, global.camera);
}


export { render };