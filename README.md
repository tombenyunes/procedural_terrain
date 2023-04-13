<img width="910" alt="banner" src="https://user-images.githubusercontent.com/58710165/231837191-4b7a1587-dd56-4b2c-a9b0-7eb64b494f25.png">

An old project that generates customisable voxel-esque land formations as a web app.  

There is generation logic for different formations; flat, islands, mountains, marsh. User interface for modifying generation real-time. Terrain can be downloaded, with layers separated. Meshes are instanced. Water uses a shader for waves and reflections use normal and environment map.  

Tech used included: JavaScript, Three.js, Improved Perlin Noise.


Downloads take a bit of time to load, and file sizes are quite large for full-size terrain downloads (200/300MB).
It is recommended to refresh the page after completing a download, as three.js doesn't always correctly dispose of the required memory.
