import * as THREE from './build/three.module.js';
import Stats from './modules/libs/stats.module.js';
import { GUI } from './modules/libs/dat.gui.module.js';
import { OrbitControls } from './modules/controls/OrbitControls.js';
import { Water } from './modules/objects/Water.js';

import { generateHeight } from './generateHeight.js';
import * as gH from './generateHeight.js';
import { getY, blocksSubmerged } from './utils.js';
import { download } from './download.js';
import './handleEvents.js';
import './raycasting.js';
import { render } from './renderLoop.js';

var container, stats, gui;
var renderer, camera, scene, controls, ambientLight, directionalLight;
var grassMesh, waterMesh_basic, sandMesh;
var waterGeometry_advanced, waterMesh_advanced, waterGeometry_advanced_merged, water, seed;

var worldSizeNeedsRemoving = true;
var worldSizeNeedsReplacing = false;
var userDefinedColors = false;
var advancedWater = false;
var VoxelDestruction = false;
var AmbientLight_Color = "#cccccc";
var DirectionalLight_Color = "#fff000";
var Terrain_Formation = 'Default';
var heightMult = 0.35;
var noiseQuality = 2;

var worldWidth = 384, worldDepth = 384;

var data = generateHeight(worldWidth, worldDepth, false, false);
seed = gH.newSeed.toFixed(20);

container = document.getElementById('threejsDiv');
renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.y = getY(worldWidth / 2, worldDepth) * 100 + 274;
camera.position.x = getY(worldWidth / 2, worldDepth) * 100 + 376;
camera.position.z = getY(worldWidth / 2, worldDepth) * 100 + 232;

scene = new THREE.Scene();
scene.background = new THREE.Color('black');

controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2.1;
controls.maxDistance = 2000;
controls.rotateSpeed = 0.5;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

stats = new Stats();
container.appendChild(stats.dom);

var terrain = new Terrain();
terrain.init();

var gui_controller = new GUI_CONTROLLER();
var world_width_controller, world_depth_controller, water_visible_controller;	// gui elements that can be removed/added entirely during runtime must be declared globally

render();



function Terrain() {

	this.init = function() {

		// console.log('Initializing Terrain');

		this.waterLevel = -7;

		this.grassCount = 0;
		this.sandCount = 0;
		this.waterCount = 0;


		// Limits and properties for each terrain type, generation rules in 'generateHeight'
		if (!userDefinedColors) {
			switch (Terrain_Formation) {
				case 'Default':
					this.sandLevel = -3;					
					this.grass_color = '#006400';
					this.sand_color = '#FFFFE0';
					this.water_color = '#000b64';

					break;
				case 'Islands':

					if (((blocksSubmerged() >= (worldDepth * worldWidth) * 0.96) || (blocksSubmerged() <= (worldDepth * worldWidth) * 0.67)) && (gui_controller != undefined)) {		// must be >0.4% AND <67% blocks above water
						gui_controller.Regenerate(false, false);	// calculated separetly from grass/sand counts to ensure fastest regeneration if necessary
						return;
					}

					this.sandLevel = 0;	
					this.grass_color = '#326e01';
					this.sand_color = '#ffffe0';
					this.water_color = '#000b64';
					break;
				case 'Mountains':

					if ((blocksSubmerged() >= (worldDepth * worldWidth) * 0.6) && (gui_controller != undefined)) {		// must be >40% blocks above water
						gui_controller.Regenerate(false, false);
						return;
					}

					this.sandLevel = 130;	
					this.grass_color = '#565953';
					this.sand_color = '#2e2e2e';
					this.water_color = '#000000';

					break;
				case 'Marsh':
					this.sandLevel = -4;	
					this.grass_color = '#214a00';
					this.sand_color = '#bdb26f';
					this.water_color = '#000b64';
					break;							
				default:
					this.sandLevel = -4;	
					this.grass_color = '#006400';
					this.sand_color = '#FFFFE0';
					this.water_color = '#000b64';
					break;
			}
		}
	

		ambientLight = new THREE.AmbientLight(AmbientLight_Color); // 0xcccccc
		scene.add(ambientLight);

		directionalLight = new THREE.DirectionalLight(DirectionalLight_Color, 1.5); // 0xffffff
		directionalLight.position.set(0, 100, 0).normalize();
		scene.add(directionalLight);


		var path = './textures/cubemap/skyboxsun25deg/';	// env map
		var format = '.jpg';
		var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

		var reflectionCube = new THREE.CubeTextureLoader().load(urls);
		scene.background = reflectionCube;	// sky box

		this.grassGeometry = new THREE.BoxGeometry(1, 10, 1);
		this.sandGeometry = new THREE.BoxGeometry(1, 10.5, 1);
		this.waterGeometry = new THREE.BoxGeometry(1, 12, 1);

		grassMesh = new THREE.InstancedMesh(this.grassGeometry, new THREE.MeshLambertMaterial({ color: this.grass_color }), worldWidth * worldDepth);
		sandMesh = new THREE.InstancedMesh(this.sandGeometry, new THREE.MeshLambertMaterial({ color: this.sand_color }), worldWidth * worldDepth);

		this.waterMaterial = new THREE.MeshLambertMaterial({
			color: this.water_color,
			envMap: reflectionCube,
			refractionRatio: 0.5,
			reflectivity: 0.3,
			combine: THREE.AddOperation
		});
		
		waterMesh_basic = new THREE.InstancedMesh(this.waterGeometry, this.waterMaterial, worldWidth * worldDepth);

		waterGeometry_advanced = new THREE.BoxGeometry(1, 1, 10);
		waterMesh_advanced = new THREE.Mesh(waterGeometry_advanced);
		waterGeometry_advanced_merged = new THREE.BoxGeometry();

		if (!advancedWater) {
						
			let index = 0;
			let transform = new THREE.Object3D();
			for (var z = 0; z < worldDepth; z++) {

				for (var x = 0; x < worldWidth; x++) {

					var h = getY(x, z);

					transform.position.set(x * 1 - (worldWidth / 2) * 1, h * 1, z * 1 - (worldDepth / 2) * 1);
					transform.updateMatrix();

					if (h >= this.sandLevel) {
						grassMesh.setMatrixAt(index++, transform.matrix);
						this.grassCount++;

					} else
					if ((h < this.sandLevel) && (h > this.waterLevel)) {
						sandMesh.setMatrixAt(index++, transform.matrix);
						this.sandCount++;

					} else
					if (h <= this.waterLevel) {
						transform.position.set(x * 1 - (worldWidth / 2) * 1, this.waterLevel, z * 1 - (worldDepth / 2) * 1);
						transform.updateMatrix();
						waterMesh_basic.setMatrixAt(index++, transform.matrix);
						this.waterCount++;
					}
				}
			}

			scene.add(waterMesh_basic);
			
		} 
		else if (advancedWater) {

			var index = 0;
			var transform = new THREE.Object3D();
			for (var z = 0; z < worldDepth; z++) {

				for (var x = 0; x < worldWidth; x++) {

					var h = getY(x, z);

					transform.position.set(x * 1 - (worldWidth / 2) * 1, h * 1, z * 1 - (worldDepth / 2) * 1);
					transform.updateMatrix();

					if (h >= this.sandLevel) {
						grassMesh.setMatrixAt(index++, transform.matrix);

					} else
					if ((h < this.sandLevel) && (h > this.waterLevel)) {
						sandMesh.setMatrixAt(index++, transform.matrix);

					} else
					if (h <= this.waterLevel) {
						transform.position.set(z * 1 - worldDepth / 2 * 1, x * 1 - worldWidth / 2 * 1, this.waterLevel + 1);
						transform.updateMatrix();
						waterGeometry_advanced_merged.merge(waterGeometry_advanced, transform.matrix);					
					}
				}
			}
		}

		water = new Water(
			waterGeometry_advanced_merged,
			{
				textureWidth: worldWidth,
				textureHeight: worldDepth,
				waterNormals: new THREE.TextureLoader().load('./textures/waternormals.jpg', function(texture) {

					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

				}),
				alpha: 1.0,
				sunDirection: directionalLight.position.clone().normalize(),
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 2,
				fog: scene.fog !== undefined
			}
		);

		water.rotation.x = - Math.PI / 2;
		water.rotation.z = - Math.PI / 2;

		if (advancedWater) {
			scene.add(water);
		}


		scene.add(grassMesh);
		scene.add(sandMesh);

	}

}





function GUI_CONTROLLER() {	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	console.log('Initializing GUI')

	this.Regenerate = function(sameSeed, customSeed, refreshSeed) {

		// console.log('Regenerating Terrain')

		while (scene.children.length > 0) {
			scene.remove(scene.children[0]); 
		}
		
		grassMesh.geometry.dispose();		// precautions to avoid memory leaks upon terrain generation
		grassMesh.material.dispose();
		scene.remove(grassMesh);

		sandMesh.geometry.dispose();
		sandMesh.material.dispose();
		scene.remove(sandMesh);

		waterMesh_basic.geometry.dispose();
		waterMesh_basic.material.dispose();
		scene.remove(waterMesh_basic);

		waterGeometry_advanced.dispose();
		waterMesh_advanced.geometry.dispose();
		waterMesh_advanced.material.dispose();
		waterGeometry_advanced_merged.dispose();

		scene.remove(ambientLight);
		scene.remove(directionalLight);

		water.geometry.dispose();
		water.material.dispose();
		scene.remove(water);

		scene.dispose();
		renderer.dispose();
		renderer.renderLists.dispose();

		if (advancedWater && worldSizeNeedsRemoving) {

			terrain_folder.remove(world_width_controller);
			terrain_folder.remove(world_depth_controller);

			misc_folder.remove(water_visible_controller);

			worldSizeNeedsReplacing = true;
			worldSizeNeedsRemoving = false;
		} else {
			if (!advancedWater && worldSizeNeedsReplacing) {

				world_width_controller = terrain_folder.add(this, 'World_Width', 32, 512).listen().name('Terrain Width');

				world_width_controller.onFinishChange(function(value) {
					worldWidth = Math.min(Math.max(parseInt(gui_controller.World_Width), 32), 512);
					gui_controller.World_Width = worldWidth;
			
					gui_controller.Regenerate(true, false);
				});
			
				world_depth_controller = terrain_folder.add(this, 'World_Depth', 32, 512).name('Terrain Depth');

				world_depth_controller.onFinishChange(function(value) {
					worldDepth = Math.min(Math.max(parseInt(gui_controller.World_Depth), 32), 512);
					gui_controller.World_Depth = worldDepth;
			
					gui_controller.Regenerate(true, false);
				});

				water_visible_controller = misc_folder.add(this, 'Water_Visible', 0, worldDepth * worldWidth).name('Water Visible');
				water_visible_controller.onChange(function(value) {		
					waterMesh_basic.count = value;
				});
			
				worldSizeNeedsReplacing = false;
				worldSizeNeedsRemoving = true;
			}
		}

		if (!sameSeed) {
			data = generateHeight(worldWidth, worldDepth, sameSeed, customSeed);
		} else
		if (refreshSeed) {
			data = generateHeight(worldWidth, worldDepth, refreshSeed, customSeed);
		}

		if (!customSeed) {
			seed = gH.newSeed.toFixed(20);
			gui_controller.Seed = seed;
		} else {
			if (seed == 0) {
				seed = gH.newSeed.toFixed(20);
			}
		}

		terrain.init();
	}

	this.showInfo = function() {
		document.getElementById('startingScreen').style.display = "block";
	}

	this.Reset_Noise = function() {
		// console.log('Noise Settings Reset');

		gui_controller.Height_Distribution = 0.35;
		heightMult = 0.35;
		gui_controller.Noise_Quality = 2;
		noiseQuality = 2;
		
		gui_controller.Regenerate(false, false);
		
		this.height_dist_controller.min(this.Min_Height_Distribution);
		this.height_dist_controller.max(this.Max_Height_Distribution);
		
		this.noise_quality_controller.max(this.Max_Noise_Quality);

		if (heightMult > gui_controller.Max_Height_Distribution) {
			heightMult = gui_controller.Max_Height_Distribution;
		} else if (heightMult < gui_controller.Min_Height_Distribution) {
			heightMult = gui_controller.Min_Height_Distribution;
		}

		if (noiseQuality > gui_controller.Max_Noise_Quality) {
			noiseQuality = gui_controller.Max_Noise_Quality;
		} 
	}

	this.Reset_Blocks_Colors = function() {
		// console.log('Block Colours Reset');

		userDefinedColors = false;

		grass_color_controller
		gui_controller.Regenerate(true, false);
	}

	this.Reset_Lighting = function() {
		// console.log('Lighting Colours Reset');

		AmbientLight_Color = "#cccccc";
		DirectionalLight_Color = "#fff000";

		gui_controller.Regenerate(true, false);
	}

	this.Download_Scene = function() {

		download();
	}



	this.countObj = new THREE.Object3D();
	this.countObj.Voxel_Quantity = worldWidth * worldDepth;
	this.Grass_Visible = worldWidth * worldDepth;
	this.Sand_Visible = worldWidth * worldDepth;
	this.Water_Visible = worldWidth * worldDepth;
	this.Voxel_Destruction = false;
	this.Voxel_Size = 1;
	this.Height_Distribution = heightMult;
	this.Noise_Quality = noiseQuality;
	this.Min_Height_Distribution = 0.02;
	this.Max_Height_Distribution = 1.5;
	this.Max_Noise_Quality = 8;
	this.Seed = seed;
	if (advancedWater) { this.Water_Type = 'Advanced' } else { this.Water_Type = 'Basic' };
	this.Terrain_Formation = 'Default';
	this.AmbientLight_Color = AmbientLight_Color;
	this.DirectionalLight_Color = DirectionalLight_Color;
	this.World_Width = worldWidth;
	this.World_Depth = worldDepth;


	gui = new GUI();
	gui.width = 312;

	gui.remember(this.countObj);
	gui.remember(terrain);
	gui.remember(water.material.uniforms);
	gui.remember(this.Height_Distribution);

	var terrain_folder = gui.addFolder('Terrain')
	terrain_folder.open();
	terrain_folder.add(this, 'Regenerate').name('[ Regenerate ]');

	var seed_controller = terrain_folder.add(this, 'Seed').listen();

	seed_controller.onFinishChange(function(value) {
		seed = gui_controller.Seed;
		gui_controller.Regenerate(false, seed);
		gui_controller.Seed = seed;
	});

	world_width_controller = terrain_folder.add(this, 'World_Width', 32, 512).listen().name('Terrain Width');

	world_width_controller.onFinishChange(function(value) {
		worldWidth = Math.min(Math.max(parseInt(value), 32), 512);
		gui_controller.World_Width = worldWidth;

		gui_controller.Regenerate(true, false, true);
	});
			
	world_depth_controller = terrain_folder.add(this, 'World_Depth', 32, 512).name('Terrain Depth');

	world_depth_controller.onFinishChange(function(value) {
		worldDepth = Math.min(Math.max(parseInt(value), 32), 512);
		gui_controller.World_Depth = worldDepth;

		gui_controller.Regenerate(true, false, true);
	});

	var terrain_formation_controller = terrain_folder.add(this, 'Terrain_Formation', ['Default', 'Islands', 'Mountains', 'Marsh']).name('Terrain Formation');

	terrain_formation_controller.onFinishChange(function(value) {
		userDefinedColors = false;

		if (value == 'Default') {
			Terrain_Formation = 'Default';
		} else 
		if (value == 'Islands') {
			Terrain_Formation = 'Islands';
		} else
		if (value == 'Mountains') {
			Terrain_Formation = 'Mountains';
		} else
		if (value == 'Marsh') {
			Terrain_Formation = 'Marsh';
		}

		gui_controller.Reset_Noise();
	});

	var water_type_controller = terrain_folder.add(this, 'Water_Type', ['Basic', 'Advanced']).name('Water Type');

	water_type_controller.onFinishChange(function(value) {

		if (gui_controller.Water_Type == 'Basic') {
			advancedWater = false;
		} else 
		if (gui_controller.Water_Type == 'Advanced') {
			worldWidth = 384;
			worldDepth = 384;

			advancedWater = true;
		}

		gui_controller.Regenerate(false, false, false);
	});

	terrain_folder.add(this, 'showInfo').name('Show Info Panel');

	var noise_folder = gui.addFolder('Noise');
	noise_folder.open();

	this.height_dist_controller = noise_folder.add(this, 'Height_Distribution', this.Min_Height_Distribution, this.Max_Height_Distribution).name('Height Distribution').listen();
	
	this.height_dist_controller.onFinishChange(function(value) {
		heightMult = gui_controller.Height_Distribution;
		gui_controller.Regenerate(true, false);
	});
	
	this.noise_quality_controller = noise_folder.add(this, 'Noise_Quality', 0.5, this.Max_Noise_Quality).name('Noise Quality').listen();
	
	this.noise_quality_controller.onFinishChange(function(value) {
		noiseQuality = Math.round(gui_controller.Noise_Quality);
		gui_controller.Regenerate(true, false, true);
	});
	
	this.noise_quality_reset_controller = noise_folder.add(this, 'Reset_Noise').name('Reset Noise Settings');


	var customization_folder = gui.addFolder('Block Colours');
	customization_folder.open();
	var grass_color_controller = customization_folder.addColor(terrain, 'grass_color').name('Grass Colour').listen();
	var sand_color_controller = customization_folder.addColor(terrain, 'sand_color').name('Sand Colour').listen();
	var water_color_controller = customization_folder.addColor(terrain, 'water_color').name('Water Colour').listen();
	var reset_colors_controller = customization_folder.add(this, 'Reset_Blocks_Colors').name('Reset Block Colours').listen();

	grass_color_controller.onFinishChange(function(value) {
		userDefinedColors = true;
		gui_controller.Regenerate(true, false);
	});
	sand_color_controller.onFinishChange(function(value) {
		userDefinedColors = true;
		gui_controller.Regenerate(true, false);
	});
	water_color_controller.onFinishChange(function(value) {
		userDefinedColors = true;
		gui_controller.Regenerate(true, false);
	});


	var lighting_folder = gui.addFolder('Lighting');
	lighting_folder.close();
	var ambient_light_color_controller = lighting_folder.addColor(this, 'AmbientLight_Color').name('Ambient Light');

	ambient_light_color_controller.onFinishChange(function(value) {
		AmbientLight_Color = gui_controller.AmbientLight_Color;

		gui_controller.Regenerate(true, false);
	});

	var directional_light_controller = lighting_folder.addColor(this, 'DirectionalLight_Color').name('Directional Light');

	directional_light_controller.onFinishChange(function(value) {
		DirectionalLight_Color = gui_controller.DirectionalLight_Color;

		gui_controller.Regenerate(true, false);
	});

	var reset_light_controller = lighting_folder.add(this, 'Reset_Lighting').name('Reset Light Colours');


	var misc_folder = gui.addFolder('Misc');
	misc_folder.open();

	var voxel_destruction_controller = misc_folder.add(this, 'Voxel_Destruction').name('Block Destruction');

	voxel_destruction_controller.onChange(function(value) {
		if (gui_controller.Voxel_Destruction == true) {
			VoxelDestruction = true;
		} else {
			VoxelDestruction = false;
		}
	});

	var grass_visible_controller = misc_folder.add(this, 'Grass_Visible', 0, worldDepth * worldWidth).name('Grass Count');
	var sand_visible_controller = misc_folder.add(this, 'Sand_Visible', 0, worldDepth * worldWidth).name('Sand Count');
	water_visible_controller = misc_folder.add(this, 'Water_Visible', 0, worldDepth * worldWidth).name('Water Count');
	
	grass_visible_controller.onChange(function(value) {		
		grassMesh.count = value;
	});

	sand_visible_controller.onChange(function(value) {		
		sandMesh.count = value;
	});

	water_visible_controller.onChange(function(value) {		
		waterMesh_basic.count = value;
	});
	

	var export_folder = gui.addFolder('Import/Export');
	export_folder.open();
	export_folder.add(this, 'Download_Scene');

}



export { gui_controller, Terrain_Formation, noiseQuality, seed, data, heightMult, worldWidth, worldDepth, terrain, VoxelDestruction, camera, renderer, grassMesh, sandMesh, water, controls, scene, stats };