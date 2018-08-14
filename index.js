'use strict'
/**
 *
 * INITIALIZING
 *
 */
/* ==================================================
=            Get canvas and set context            =
================================================== */
var canvas = document.getElementById('c')
var gl = canvas.getContext('webgl')
if (!gl) {
  console.log('please enable webgl')
}

/* ============================================================
=            Create, Upload & Compile GLSL Source            =
============================================================ */
function createShader (gl, type, source) {
  // compile shader
  var shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  // check if compiled successfully
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  // log and delete results on failure
  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}
var vertexShaderSource = document.getElementById('2d-vertex-shader').text
var fragmentShaderSource = document.getElementById('2d-fragment-shader').text

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

/* ===============================================
=            Link shaders to program            =
=============================================== */
function createProgram (gl, vertexShader, fragmentShader) {
  // attach and link program
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  // return if success
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) return program

  // log and delete results on failure
  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}
var program = createProgram(gl, vertexShader, fragmentShader)

/* =============================================================
=            Supply necessary data to GLSL program            =
============================================================= */
// look up position of attribute in compiled program
// should be done during initialization, not in render loop
var positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')

// Create buffer for attribute to get data
var positionBuffer = gl.createBuffer()

// establish bind point. bind the position buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// put data into buffer (ex. three 2d points)
var positions = [
  10, 20,
  80, 20,
  10, 30,
  10, 30,
  80, 20,
  80, 30
]
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

/**
 *
 * RENDERING
 *
 */
// Call in render loop resize(gl.canvas)
// Make sure to update clipspace after resize so clipsace still (-1 to +1)
// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
function resize (canvas) {
  // For high HD screens alter or pixel density
  // If performace needs upgrade draw less px by making
  // this value 1, phones and other devices will scale
  // it up. less pretty, more performant.
  var realToCSSPixels = window.devicePixelRatio

  // Lookup the size the browser is displaying the canvas
  // and alter depending on pixel density
  var displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels)
  var displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels)

  // Check if the canvas is not the same size
  if (canvas.width !== displayWidth ||
    canvas.height !== displayHeight) {
    // Make the canvas the same size
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

function main () {
  // This is the built in version of this function
  // webglUtils.resizeCanvasToDisplay(gl.canvas)
  resize(gl.canvas)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // Set clear color on canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Tell WebGL what shaders to execute
  gl.useProgram(program)

  // set the resolution
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  /* =====================================================
  =            Tell WebGL how to take buffer            =
  ===================================================== */
  // Turn attribute on
  gl.enableVertexAttribArray(positionAttributeLocation)

  // Then specify how to pull data out
  // Bind position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Tell the attribute how to get data out of positionbuffer (ARRAY_BUFFER)
  var size = 2 // 2 components per iteration
  var type = gl.FLOAT // Data in 32 bit floats
  var normalize = false // don't normalize the data
  var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get next position
  var offset = 0 // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  )

  /* ================================================
  =            WebGL to Execute program            =
  ================================================ */
  // draw
  var primitiveType = gl.TRIANGLES
  var drawOffset = 0
  var count = 6
  gl.drawArrays(primitiveType, drawOffset, count)
}
main()
