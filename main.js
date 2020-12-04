function main() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  var vertices = [];
  var cubePoints = [
    [-0.5,  0.5,  0.5],   // A, 0
    [-0.5, -0.5,  0.5],   // B, 1
    [ 0.5, -0.5,  0.5],   // C, 2 
    [ 0.5,  0.5,  0.5],   // D, 3
    [-0.5,  0.5, -0.5],   // E, 4
    [-0.5, -0.5, -0.5],   // F, 5
    [ 0.5, -0.5, -0.5],   // G, 6
    [ 0.5,  0.5, -0.5]    // H, 7 
  ];
  var cubeColors = [
    [],
    [1.0, 0.0, 0.0],    // merah
    [1.0, 0.0, 0.0],    // merah
    [1.0, 0.0, 0.0],    // merah
    [1.0, 0.0, 0.0],    // merah
    [1.0, 0.0, 0.0],    // merah
    [1.0, 0.0, 0.0],    // merah
    // [0.0, 1.0, 0.0],    // hijau
    // [0.0, 0.0, 1.0],    // biru
    // [1.0, 1.0, 1.0],    // putih
    // [1.0, 0.5, 0.0],    // oranye
    // [1.0, 1.0, 0.0],    // kuning
    []
  ];

  var cubeNormals = [
    [],
    [0.0, 0.0, 1.0],    // depan
    [1.0, 0.0, 0.0],    // kanan
    [0.0, 1.0, 0.0],    // atas
    [-1.0, 0.0, 0.0],   // kiri
    [0.0, 0.0, -1.0],   // belakang
    [0.0, -1.0, 0.0],   // bawah
    []
  ];

  function quad(a, b, c, d) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
      var point = cubePoints[indices[i]];  // [x, y, z]
      for (var j=0; j<point.length; j++) {
        vertices.push(point[j]);
      }
      var color = cubeColors[a]; // [r, g, b]
      for (var j=0; j<color.length; j++) {
        vertices.push(color[j]);
      }
      var normal = cubeNormals[a];
      for (var j=0; j<normal.length; j++) {
        vertices.push(normal[j]);
      }
    }
  }
  quad(1, 2, 3, 0); // DEPAN, merah
  quad(2, 6, 7, 3); // KANAN, hijau
  quad(3, 7, 4, 0); // ATAS, biru
  quad(4, 5, 1, 0); // KIRI, putih
  quad(5, 4, 7, 6); // BELAKANG, oranye
  quad(6, 2, 1, 5); // BAWAH, kuning

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var vertexShaderSource = document.getElementById("vertexShaderSource").text;
  var fragmentShaderSource = document.getElementById("fragmentShaderSource").text;

  // Buat .c di GPU
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);

  // Kompilasi .c agar menjadi .o
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  // Siapkan wadah untuk .exe (shader program)
  var shaderProgram = gl.createProgram();

  // Masukkan .o ke dalam wadah .exe
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  // Sambungkan antar .o agar bisa menjadi
  //    runnable context di dalam wadah .exe tadi
  gl.linkProgram(shaderProgram);

  // Mulai menggunakan konteks (cat)
  gl.useProgram(shaderProgram);

  // Ajarkan attribute a_Position di GPU
  //  tentang pengambilan data verteks dari ARRAY_BUFFER
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var aPositionLoc = gl.getAttribLocation(shaderProgram, "a_Position");
  var aColorLoc = gl.getAttribLocation(shaderProgram, "a_Color");
  var aNormalLoc = gl.getAttribLocation(shaderProgram, "a_Normal");
  gl.vertexAttribPointer(
    aPositionLoc, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    0);
  gl.vertexAttribPointer(
    aColorLoc, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    3 * Float32Array.BYTES_PER_ELEMENT);
  gl.vertexAttribPointer(
    aNormalLoc, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    6 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.enableVertexAttribArray(aColorLoc);
  gl.enableVertexAttribArray(aNormalLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.viewport(100, 0, canvas.height, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  var primitive = gl.TRIANGLES;
  var offset = 0;
  var nVertex = 36;

  var u_Model = gl.getUniformLocation(shaderProgram, 'u_Model');
  var u_View = gl.getUniformLocation(shaderProgram, 'u_View');
  var u_Projection = gl.getUniformLocation(shaderProgram, 'u_Projection');
  var model = glMatrix.mat4.create();
  var view = glMatrix.mat4.create();
  var projection = glMatrix.mat4.create();
  gl.uniformMatrix4fv(u_Projection, false, projection);

  var linearspeed = 0.01;
  var angularspeed = glMatrix.glMatrix.toRadian(1);
  function onKeyDown(event) {
    console.log(event.keyCode);
    if (event.keyCode == 65) {
      glMatrix.mat4.translate(model, model, [-linearspeed, 0.0, 0.0]);
    } // A = 65
    else if (event.keyCode == 68) {
      glMatrix.mat4.translate(model, model, [linearspeed, 0.0, 0.0]);
    } // D = 68
    if (event.keyCode == 87) {
      glMatrix.mat4.translate(model, model, [0.0, linearspeed, 0.0]);
    } // W = 87
    if (event.keyCode == 83) {
      glMatrix.mat4.translate(model, model, [0.0, -linearspeed, 0.0]);
    } // S = 83
  }
  document.addEventListener('keydown', onKeyDown);

  var uNormalModel = gl.getUniformLocation(shaderProgram, 'u_NormalModel');
  var uAmbientColor = gl.getUniformLocation(shaderProgram, 'u_AmbientColor');
  gl.uniform3fv(uAmbientColor, [0.5, 0.5, 0.5]);
  var uLightColor = gl.getUniformLocation(shaderProgram, 'u_LightColor');
  gl.uniform3fv(uLightColor, [1, 1, 1]);
  var uLightPosition = gl.getUniformLocation(shaderProgram, 'u_LightPosition');
  gl.uniform3fv(uLightPosition, [2, -3, 3]);

  // glMatrix.mat4.rotate(model, model, glMatrix.glMatrix.toRadian(45), [1.0, 1.0, 1.0]);
  
  function render() {
    glMatrix.mat4.rotate(model, model, angularspeed, [1.0, 1.0, 1.0]);
    gl.uniformMatrix4fv(u_Model, false, model);
    gl.uniformMatrix4fv(u_View, false, view);
    var normalModel = glMatrix.mat3.create();
    glMatrix.mat3.normalFromMat4(normalModel, model);
    gl.uniformMatrix3fv(uNormalModel, false, normalModel);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(primitive, offset, nVertex);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
