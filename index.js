async function fetchShader(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load shader: ${url}`);
  }
  return await response.text();
}

async function createShader(gl, type, url) {
  const source = await fetchShader(url);
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
var mousePosition = [0, 0]; // Initialize mouse position

async function initWebGL() {
  const gl = document.getElementById("background").getContext('webgl');
  const vertexShader = await createShader(gl, gl.VERTEX_SHADER, 'passthrough.vert');
  const fragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, 'background.frag');
  const program = createProgram(gl, vertexShader, fragmentShader);

  const timeUniformLocation = gl.getUniformLocation(program, "u_time");
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse');

  gl.canvas.addEventListener('mousemove', function(event) {
    // Calculate mouse position in WebGL coordinates
    var rect = gl.canvas.getBoundingClientRect();
    mousePosition[0] = (event.clientX - rect.left) / gl.canvas.width;
    mousePosition[1] = 1.0 - (event.clientY - rect.top) / gl.canvas.height;
  });

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var positions = [
    -1, -1,
    -1, 1,
    1, 1,
    1, 1,
    1, -1,
    -1, -1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  requestAnimationFrame(function render(time) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    if (resizeCanvas(gl)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    gl.uniform1f(timeUniformLocation, time * 0.001);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(mouseUniformLocation, mousePosition[0], mousePosition[1]);

    var primitiveType = gl.TRIANGLES;
    gl.drawArrays(primitiveType, offset, 6);

    requestAnimationFrame(render);
  });
}

function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function resizeCanvas(gl) {
  const displayWidth = gl.canvas.clientWidth;
  const displayHeight = gl.canvas.clientHeight;
  const needResize = gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight;
  if (needResize) {
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
  }
  return needResize;
}

// Start the WebGL program
initWebGL();

function openTab(tabName) {
  var allTabs = document.getElementsByClassName("tab");
  var tab = document.getElementById(tabName);
  var wasOpen = tab.style.height !== '0px' && tab.style.height !== '';

  // Iterate over all tabs
  for (var i = 0; i < allTabs.length; i++) {
      var currentTab = allTabs[i];
      currentTab.style.height = '0'; // Close all tabs
      currentTab.classList.remove('tab-active'); // Remove active class from tabs

      // Remove highlight from all buttons
      var btn = document.querySelector(`.btn[data-tab="${currentTab.id}"]`);
      if (btn) {
          btn.classList.remove('btn-active');
      }
  }

  // Toggle the clicked tab
  if (!wasOpen) {
      tab.classList.add('tab-active');
      tab.style.height = 'auto';
      var fullHeight = tab.clientHeight + 'px';
      tab.style.height = '0';

      setTimeout(() => {
          tab.style.height = fullHeight;
      }, 10);

      // Highlight the button corresponding to the open tab
      var activeBtn = document.querySelector(`.btn[data-tab="${tabName}"]`);
      if (activeBtn) {
          activeBtn.classList.add('btn-active');
      }
  }
}