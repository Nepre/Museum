var gl;
var model;


var InitDemo = function () {
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

var RunDemo = function (vertexShaderText, fragmentShaderText, imgFile, modelPar) {
  var canvas = document.getElementById('my-canvas');
  var gl = canvas.getContext('webgl');
  model = modelPar;
  console.log(model);

  if(!gl){
    return;
  }

  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  // gl.viewport(0,0, window.innerWidth, window.innerHeight);

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.frontFace(gl.CW);

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

  var program = gl.createProgram();
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
  var boxVertices = model.meshes[12].vertices;

	var boxIndices = [].concat.apply([], model.meshes[12].faces);
  console.log(boxIndices);

  var boxTexCoords = model.meshes[12].texturecoords[0];

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

  //
  // Create texture
  //
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

  // Tell OpenGL state machine which program will be active
  gl.useProgram(program);


  var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  var worldMatrix = new Float32Array(16);
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
    angle = performance.now() / 1000 / 6 * 2 * Math.PI; // ROTATION EVERY 6 SECONDS
    mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
    //mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1, 0, 0]);
    //mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  gl.drawArrays(gl.TRIANGLES, 0, 3); //How , skipped vertex, number of vertex

 };
