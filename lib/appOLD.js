let modelsDir = "Assets/";
let shaderDir = "shaders/";

let loadedAssets = []; //Assets loaded

function readJSON(path) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
      if (this.status == 200) {
          var file = new File([this.response], 'temp');
          var fileReader = new FileReader();
          fileReader.addEventListener('load', function(){
               //do stuff with fileReader.result
          });
          fileReader.readAsText(file);
      }
    }
    xhr.send();
}

function loadModel(modelName) {

	//CORS ERROR HERE
	utils.get_json(modelsDir + modelName, function (loadedModel) {
      console.log(loadedModel);
			 //preparing to store objects' world matrix & the lights & material properties per object
			 for (let i = 0; i < loadedModel.meshes.length; i++) {
					 let mesh = loadedModel.meshes[i];

					 let meshMatIndex = mesh.materialindex;
					 let material = loadedModel.materials[meshMatIndex];

					 let object = GLObjectModel.create(material, mesh, loadedModel.rootnode.children[i].transformation);

					 sceneObjects.push(object);
			 }
	 });
}

function main(){
	var canvas = document.getElementById("my-canvas");
	/*
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);*/

	try{
		gl= canvas.getContext("webgl2");
	} catch(e){
		console.log(e);
	}

	if (gl) {

		let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.viewport(0.0, 0.0, w, h);
    gl.enable(gl.DEPTH_TEST);
    perspectiveMatrix = utils.MakePerspective(60, w / h, 0.1, 1000.0);
		loadModel("museumTri.json");
		console.log(loadedAssets);
	}
}
