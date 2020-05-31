import { GLTFExporter } from './modules/exporters/GLTFExporter.js';
import { PLYExporter } from './modules/exporters/PLYExporter.js';


function exportGLTF(input) {

  var gltfExporter = new GLTFExporter();

  var options = {
    trs: false,
    onlyVisible: true,
    truncateDrawRange: false,
    binary: true,
    forcePowerOfTwoTextures: false,
    maxTextureSize: 4096,
    forceIndices: true
  };

  gltfExporter.parse(input, function (result) {

    if (result instanceof ArrayBuffer) {
      
      saveArrayBuffer(result, 'scene.glb');

    } else {

      var output = JSON.stringify(result, null, 2);
      console.log(output);
      saveString(output, 'scene.gltf');

    }

  }, options);

  // var exporter = new PLYExporter();
  // exporter.parse( input, function ( result ) {

  //   saveArrayBuffer( result, 'box.ply' );

  // }, { binary: true } );

}

var link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);  // workaround that doesn't cause firefox to lose the will to live

function save(blob, filename) {

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

}

function saveString(text, filename) {

  save(new Blob([text], { type: 'text/plain' }), filename);

}

function saveArrayBuffer(buffer, filename) {

  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

}


export { exportGLTF }