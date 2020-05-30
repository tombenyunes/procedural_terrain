import * as global from './main.js';


function getY(x, z) {

	return (global.data[x + z * global.worldWidth] * global.heightMult) | 0;
}

function blocksSubmerged() {

	var c = 0;
	for (var z = 0; z < global.worldDepth; z++) {
		for (var x = 0; x < global.worldWidth; x++) {
			if (getY(x, z) <= global.terrain.waterLevel) {
				c++;
			}
		}
	}
	return c;
}


export { getY, blocksSubmerged };