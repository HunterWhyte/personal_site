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

async function initWebGL() {
  const gl = document.getElementById("background").getContext('webgl');
  const vertexShader = await createShader(gl, gl.VERTEX_SHADER, 'passthrough.vert');
  const fragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, 'background.frag');
  const program = createProgram(gl, vertexShader, fragmentShader);

  const timeUniformLocation = gl.getUniformLocation(program, "u_time");
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

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
  var tab = document.getElementById(tabName);
  var isOpen = tab.style.height !== '0px' && tab.style.height !== ''; // Check if the tab is open

  // Close all tabs
  var allTabs = document.getElementsByClassName("tab");
  for (var i = 0; i < allTabs.length; i++) {
      allTabs[i].style.height = '0'; // Set height to 0 to close the tab
      allTabs[i].classList.remove('tab-active'); // Remove active class
  }

  // If the clicked tab was already open (and now closed), do not reopen it
  if (isOpen) return;

  // Open the clicked tab if it was not already open
  tab.classList.add('tab-active'); // Add active class for padding
  tab.style.height = 'auto'; // Set height to auto to fit content
  var fullHeight = tab.clientHeight + 'px'; // Get the full height
  tab.style.height = '0'; // Reset height to 0 to start the transition

  // Use setTimeout to allow the browser to render the height change to '0'
  setTimeout(() => {
      tab.style.height = fullHeight; // Set the full height to expand the tab
  }, 10); // Small timeout before starting the animation
}
