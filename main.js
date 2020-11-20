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

  var uD = gl.getUniformLocation(shaderProgram, 'u_d');
  var d = [0.5, 0.5];

  var freeze = false;
  function onMouseClick(event) {
    freeze = !freeze; // kita negasikan nilai freeze
  }
  document.addEventListener('click', onMouseClick);
  function onKeyDown(event) {
    if(event.keyCode == 32) freeze = true;
  }
  function onKeyUp(event) {
    if(event.keyCode == 32) freeze = false;
  }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  function onGamepadConnected(event) {
    console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
    event.gamepad.index, event.gamepad.id, event.gamepad.buttons.length, event.gamepad.axes.length);
    freeze = true;
  }
  function onGamepadDisconnected(event) {
    console.log('Gamepad removed at index %d: %s.', e.gamepad.index, e.gamepad.id);
    freeze = false;
  };
  window.addEventListener('gamepadconnected', onGamepadConnected);
  window.addEventListener('gamepaddisconnected', onGamepadDisconnected);
  
  function render() {
    if(navigator.webkitGetGamepads) {
      console.log("1 " + navigator.webkitGetGamepads);
      var gp = navigator.webkitGetGamepads()[0];
      if (gp != null) {
        if(gp.buttons[0] == 1) {
          d[1] -= 0.005;
        } else if(gp.buttons[3] == 1) {
          d[1] = 0.005;
        } 
        if(gp.buttons[1] == 1) {
          d[0] = 0.005;
        } else if(gp.buttons[2] == 1) {
          d[0] -= 0.005;
        }
      }
    } else {
      var gp = navigator.getGamepads()[0];
      if (gp != null) {
        if(gp.buttons[0].value > 0 || gp.buttons[0].pressed == true) {
          d[1] -= 0.005;
        } else if(gp.buttons[3].value > 0 || gp.buttons[3].pressed == true) {
          d[1] += 0.005;
        }
        if(gp.buttons[1].value > 0 || gp.buttons[1].pressed == true) {
          d[0] += 0.005;
        } else if(gp.buttons[2].value > 0 || gp.buttons[2].pressed == true) {
          d[0] -= 0.005;
        }
      }
      else {
        console.log("No connected gamepad");
      }
    }
    if (!freeze) {
      // jika freeze == false, lakukan inkrementasi dx dan dy
      d[0] -= 0.001;
      d[1] -= 0.001;
    }
    gl.uniform2fv(uD, d);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(primitive, offset, nVertex);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  d[0] = 0.0;
  d[1] = 0.0;
}
