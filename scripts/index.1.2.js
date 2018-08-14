'use strict'
function main () {
  // Get WebGL context
  /** @type {HTMLCanvasElement} **/
  var canvas = document.getElementById('c')
  var gl = canvas.getContext('webgl')
  if (!gl) return console.log('WebGL not enabled!')

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(
    gl,
    ['2d-vertex-shader',
      '2d-fragment-shader'])

  // look up where the vertex data needs tp go
  var positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

  // look up uniform locations
  var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  var colorUniformLocation = gl.getUniformLocation(program, 'u_color')

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer()

  webglUtils.resizeCanvasToDisplaySize(gl.canvas)

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation)

  // Bind the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Tell the attribute how to get data out of positionBuffer
  // (gl.ARRAY_BUFFER)
  var size = 2 // 2 components per iteration
  var type = gl.FLOAT
  var normalize = false
  var stride = 0
  var offset = 0
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  )

  // set the resolution
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  // draw 50 random rectangles in random color
  for (var ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    // This will write to positionBuffer because
    // its the last thing we bound on the ARRAY_BUFFER
    // bind point
    setRectangle(
      gl,
      randomInt(300),
      randomInt(300),
      randomInt(300),
      randomInt(300)
    )

    // set the random color
    gl.uniform4f(
      colorUniformLocation,
      Math.random(),
      Math.random(),
      Math.random(),
      1
    )

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES
    var offsetShape = 0
    var count = 6
    gl.drawArrays(primitiveType, offsetShape, count)
  }
}

// Returns a random interger from 0->(range-1)
function randomInt (range) {
  return Math.floor(Math.random() * range)
}

// Fill the buffer with the values that define a trectangle
function setRectangle (gl, x, y, width, height) {
  var x1 = x
  var x2 = x + width
  var y1 = y
  var y2 = y + height
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ]), gl.STATIC_DRAW)
}

main()
