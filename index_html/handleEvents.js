import * as global from './main.js';


window.addEventListener('resize', onWindowResize, false);

document.onkeydown = function (evt) {   // open/close welcome screen when escape is pressed
  evt = evt || window.event;
  if (evt.keyCode == 27) {
    if (document.getElementById('startingScreen').style.display == "none") {
      document.getElementById('startingScreen').style.display = "block";
    } else {
      document.getElementById('startingScreen').style.display = "none";
    }
  }
};

function onWindowResize() {   // resize canvas to fit window when resized

  global.camera.aspect = window.innerWidth / window.innerHeight;
  global.camera.updateProjectionMatrix();

  global.renderer.setSize(window.innerWidth, window.innerHeight);
}