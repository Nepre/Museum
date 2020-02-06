var gl = null;
var canvas = null;
var model;
var worldMatrix;
var matWorldUniformLocation;
var program;
var imgFileAux;

var Objects = []; //Object array
var TexturesFile = [];
var Textures = [];


var InitDemo = function () {
  canvas = document.getElementById('my-canvas');
  gl = canvas.getContext('webgl');
  loadTextResource('./lib/shader.vs.glsl', function (vsErr, vsText) {
    if(vsErr){
      alert('Fatal error getting vertex shader');
      console.error(vsErr);
    } else {
      loadTextResource('./lib/shader.fs.glsl', function ( fsErr, fsText) {
        if (fsErr) {
          alert('Fatal error getting vertex shader');
          console.error(fsErr);
        }
        else{
          loadJSONResource('/Assets/museumTri.json', function ( modelErr, modelObj) {
            if(modelErr){
              alert('Fatal error getting model');
              console.error(fsErr);
            } else {
              loadImage('/Assets/wall.png', function (imgErr, img) {
                if (imgErr) {
                  alert('Fatal error getting img');
                  console.error(imgErr);
                } else {
                  RunDemo(vsText, fsText, img, modelObj);
                }
              });
            }
          });

        }
      })
    }
  });
};

function initArray(){
  var dir = '/Assets/';

  var names = [
    'Picasso_Guernica.jpg',
    'Seurat_a_sunday.png',
    'Volpedo_FourthEstate.png',
    'starringNight.jpg',
    'theBathers_Cezanne.jpg',
    'VanGogh_self.png',
    'pisarro_boulevard_monmarte.jpg',
    'Munch_Scream.png',
    'Monet-Sunrise.jpg',
    'Matisse_theDance.jpg',
    'Manet_Dejeuner.jpg',
    'parquet.png',
    'wall.png'
  ]


  for (let i = 0; i < names.length; i++) {

    loadImage(dir + names[i], function(imgErr, img){
      var boxTexture;
      
      boxTexture = gl.createTexture();
    
      gl.bindTexture(gl.TEXTURE_2D, boxTexture);

      if(i > 10 || i == 7 || i == 5 || i == 2){
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      }
      else{
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        img
      );

      Textures[i] = boxTexture;
      gl.bindTexture(gl.TEXTURE_2D, null);
      });
  }

}

function drawObject(number){
  
  var boxVertices = model.meshes[number].vertices;

	var boxIndices = [].concat.apply([], model.meshes[number].faces);
  //console.log(boxIndices);

  var boxTexCoords = model.meshes[number].texturecoords[0];
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

  //console.log("number "+ number + ":" + Textures[number])
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, Textures[number]);
  
  

  var boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  var boxTexCoordVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxTexCoordVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxTexCoords), gl.STATIC_DRAW);

  var boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  gl.vertexAttribPointer(
    positionAttribLocation, //Attribute location
    3, // Number of elements per attribute (it is a vec2 so 2)
    gl.FLOAT, //Type of elements
    gl.FALSE, //normalized data
    3 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
    0//Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, boxTexCoordVertexBufferObject);
  var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
  gl.vertexAttribPointer(
    texCoordAttribLocation, //Attribute location
    2, // Number of elements per attribute (it is a vec2 so 2)
    gl.FLOAT, //Type of elements
    gl.FALSE, //normalized data
    2 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
    0 * Float32Array.BYTES_PER_ELEMENT//Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(texCoordAttribLocation);

  gl.drawElements(gl.TRIANGLES,  boxIndices.length, gl.UNSIGNED_SHORT, 0);

}


var RunDemo = function (vertexShaderText, fragmentShaderText, imgFile, modelPar) {
  model = modelPar;
  console.log(model);

  if(!gl){
    return;
  }

  imgFileAux = imgFile;


  

  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  // gl.viewport(0,0, window.innerWidth, window.innerHeight);

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.frontFace(gl.CW);
  /*
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  */

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error('ERROR VERTEX SHADER!', gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    console.error('ERROR FRAGMENT SHADER!', gl.getShaderInfoLog(fragmentShader));
    return;
  }

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error('ERROR LINKING PROGRAM!', gl.getProgramInfoLog(program));
    return;
  }

  //
  // Create Buffer
  //

  initArray("/Assets/museumTri.json");

  //
  // Create texture
  //
  /*
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    imgFile
  );

  gl.bindTexture(gl.TEXTURE_2D, null);
  */

  // Tell OpenGL state machine which program will be active
  gl.useProgram(program);


  matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 3, 10], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);

  //
  // Main Render Loop
  //
  var angle = 0;
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);

  var loop = function(){
    
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    

    angle = performance.now() / 1000 / 25 * 2 * Math.PI; // ROTATION EVERY 6 SECONDS
    mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
    //mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1, 0, 0]);
    //mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    

    
    
    for (let i = 0; i < model.meshes.length; i++) {
      drawObject(i);
    }
    
 
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  gl.drawArrays(gl.TRIANGLES, 0, 3); //How , skipped vertex, number of vertex

 };
