import { ImprovedNoise } from './modules/math/ImprovedNoise.js';

import * as global from './main.js';

var currentNoiseQuality = global.noiseQuality;
var newSeed;


function generateHeight(width, height, sameSeed, customSeed) {

	var data = []
	var perlin = new ImprovedNoise();
	var size = width * height;
  currentNoiseQuality = global.noiseQuality;

	if ((sameSeed == true) && (global.seed != undefined)) {
		var z = global.seed;
		console.log('SAME seed: ' + global.seed)
	}
	else if ((!sameSeed) && (customSeed != undefined) && (customSeed != false)) {
		// if (customSeed != global.seed) {
			var z = customSeed;
			console.log('CUSTOM seed: ' + global.seed)
		// }
	}
	else {
		var z = Math.random() * 100;
		newSeed = z;
    console.log('NEW seed: ' + newSeed);
	}

	if (global.gui_controller != undefined) {
		global.gui_controller.Seed = global.seed;
	}

	if (global.Terrain_Formation == 'Default') {
		// console.log('Terrain Formation: Default')

		if (global.gui_controller != undefined) {
			global.gui_controller.Min_Height_Distribution = 0.02;
			global.gui_controller.Max_Height_Distribution = 1.5;
			global.gui_controller.Max_Noise_Quality = 5;
		}

		for (var j = 0; j < 4; j++) {
	
			if (j === 0) for (var i = 0; i < size; i++) data[i] = 0;
	
			for (var i = 0; i < size; i++) {
	
				var x = i % width
        var y = (i / width) | 0;
        
        data[i] += 1 * (perlin.noise(x / currentNoiseQuality, y / currentNoiseQuality, z) * currentNoiseQuality)
                + 0.5 * (perlin.noise(x / (currentNoiseQuality * 2), y / (currentNoiseQuality * 2), z) * (currentNoiseQuality * 2))
								+ 0.25 * (perlin.noise(x / (currentNoiseQuality * 4), y / (currentNoiseQuality * 4), z) * (currentNoiseQuality * 4))
			}
	
			currentNoiseQuality *= 4;
		}
	} else 
	if (global.Terrain_Formation == 'Islands') {
		// console.log('Terrain Formation: Islands')

		if (global.gui_controller != undefined) {
			global.gui_controller.Min_Height_Distribution = 0.2;
			global.gui_controller.Max_Height_Distribution = 1.5;
			global.gui_controller.Max_Noise_Quality = 2.5;
		}

		for (var j = 0; j < 4; j++) {
	
			if (j === 0) for (var i = 0; i < size; i++) data[i] = 0;
	
			for (var i = 0; i < size; i++) {
	
				var x = i % width
				var y = (i / width) | 0;
				
				data[i] += 1 * (perlin.noise(x / currentNoiseQuality, y / currentNoiseQuality, z) * currentNoiseQuality)
								+ 0.5 * (perlin.noise(x / (currentNoiseQuality * 2), y / (currentNoiseQuality * 2), z) * (currentNoiseQuality * 2))
								+ 0.25 * (perlin.noise(x / (currentNoiseQuality * 4), y / (currentNoiseQuality * 4), z) * (currentNoiseQuality * 2));
			}

			
			currentNoiseQuality *= 4;
		}

		let index = 0;
		for (let x = 0; x < global.worldDepth; x++) {
			for (let z = 0; z < global.worldWidth; z++) {
				let distanceX = ((global.worldWidth / 2) - x) * ((global.worldWidth / 2) - x)
				let distanceY = ((global.worldDepth / 2) - z) * ((global.worldDepth / 2) - z)

				var distanceToCenter = Math.sqrt(distanceX + distanceY);
		
				data[index] -= distanceToCenter / 2;

				index++;
			}
		}
	} else 

	if (global.Terrain_Formation == 'Mountains') {
		// console.log('Terrain Formation: Mountains');
		
		if (global.gui_controller != undefined) {
			global.gui_controller.Min_Height_Distribution = 0.02;
			global.gui_controller.Max_Height_Distribution = 0.5;
			global.gui_controller.Max_Noise_Quality = 2;
		}

		for (var j = 0; j < 4; j++) {
	
			if (j === 0) for (var i = 0; i < size; i++) data[i] = 0;
	
			for (var i = 0; i < size; i++) {
	
				var x = i % width
				var y = (i / width) | 0;

				data[i] += 4 * (perlin.noise(x / currentNoiseQuality, y / currentNoiseQuality, z) * currentNoiseQuality)
								+ 2 * (perlin.noise(x / (currentNoiseQuality * 2), y / (currentNoiseQuality * 2), z) * (currentNoiseQuality * 2))
								+ 1 * (perlin.noise(x / (currentNoiseQuality * 4), y / (currentNoiseQuality * 4), z) * (currentNoiseQuality * 2));
								
			}
			
			currentNoiseQuality *= 5;
		}
	} else

	if (global.Terrain_Formation == 'Marsh') {
		// console.log('Terrain Formation: Marsh');

		if (global.gui_controller != undefined) {
			global.gui_controller.Min_Height_Distribution = 0.02;
			global.gui_controller.Max_Height_Distribution = 1.5;
			global.gui_controller.Max_Noise_Quality = 5;
		}

		for (var j = 0; j < 4; j++) {
	
			if (j === 0) for (var i = 0; i < size; i++) data[i] = 0;
	
			for (var i = 0; i < size; i++) {
	
				var x = i % width
				var y = (i / width) | 0;

				data[i] += 1 * (perlin.noise(x / currentNoiseQuality, y / currentNoiseQuality, z) * currentNoiseQuality)
								+ 0.1 * (perlin.noise(x / (currentNoiseQuality * 2), y / (currentNoiseQuality * 2), z) * (currentNoiseQuality * 2))
								+ 0.1 * (perlin.noise(x / (currentNoiseQuality * 4), y / (currentNoiseQuality * 4), z) * (currentNoiseQuality * 2));
								
			}
	
			currentNoiseQuality *= 3;
		}
	}
	
	return data;
}


export { generateHeight, newSeed };