function main() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  // Definisi data verteks 3 buah titik
  /**
   * Titik A (-0.5, -0.5)
   * Titik B ( 0.5, -0.5)
   * Titik C ( 0.5,  0.5)
   * Titik D (-0.5,  0.5)
   */
  var vertices = [
    -0.5, -0.5, 1.0, 0.0, 0.0,      // Titik A, MERAH
    0.5, -0.5, 0.0, 1.0, 0.0,       // Titik B, HIJAU
    0.5, 0.5, 0.0, 0.0, 1.0,        // Titik C, BIRU
    -0.5, -0.5, 1.0, 1.0, 1.0,      // Titik A, PUTIH
    0.5, 0.5, 1.0, 1.0, 1.0,        // Titik C, PUTIH
    -0.5, 0.5, 1.0, 1.0, 1.0        // Titik D, PUTIH
  ];

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
  gl.vertexAttribPointer(
    aPositionLoc, 
    2, 
    gl.FLOAT, 
    false, 
    5 * Float32Array.BYTES_PER_ELEMENT, 
    0);
  gl.vertexAttribPointer(
    aColorLoc, 
    3, 
    gl.FLOAT, 
    false, 
    5 * Float32Array.BYTES_PER_ELEMENT, 
    2 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.enableVertexAttribArray(aColorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.viewport(100, 0, canvas.height, canvas.height);

  var primitive = gl.TRIANGLES;
  var offset = 0;
  var nVertex = 6;

  var u_Model = gl.getUniformLocation(shaderProgram, 'u_Model');
  var u_View = gl.getUniformLocation(shaderProgram, 'u_View');
  var u_Projection = gl.getUniformLocation(shaderProgram, 'u_Projection');
  var model = glMatrix.mat4.create();
  var view = glMatrix.mat4.create();
  var projection = glMatrix.mat4.create();
  gl.uniformMatrix4fv(u_Projection, false, projection);

  var speed = 0.01;
  function onKeyDown(event) {
    console.log(event.keyCode);
    if (event.keyCode == 65) {
      glMatrix.mat4.translate(model, model, [-speed, 0.0, 0.0]);
    } // A = 65
    else if (event.keyCode == 68) {
      glMatrix.mat4.translate(model, model, [speed, 0.0, 0.0]);
    } // D = 68
    if (event.keyCode == 87) {
      glMatrix.mat4.translate(model, model, [0.0, speed, 0.0]);
    } // W = 87
    if (event.keyCode == 83) {
      glMatrix.mat4.translate(model, model, [0.0, -speed, 0.0]);
    } // S = 83
  }
  document.addEventListener('keydown', onKeyDown);
  
  function render() {
    gl.uniformMatrix4fv(u_Model, false, model);
    gl.uniformMatrix4fv(u_View, false, view);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(primitive, offset, nVertex);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
