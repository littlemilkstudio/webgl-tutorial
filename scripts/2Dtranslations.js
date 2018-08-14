'use strict'

function main () {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById('c')
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ['2d-vertex-shader', '2d-fragment-shader'])

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, 'a_position')

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  var colorLocation = gl.getUniformLocation(program, 'u_color')

  var translation = [100, 0]
  var width = 100
  var height = 30
  var color = [Math.random(), Math.random(), Math.random(), 1]

  drawScene()

  // Draw a the scene.
  function drawScene () {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program)

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation)

    // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer()

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // Setup a rectangle
    setRectangle(gl, translation[0], translation[1], width, height)

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2 // 2 components per iteration
    var type = gl.FLOAT // the data is 32bit floats
    var normalize = false // don't normalize the data
    var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset)

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

    // set the color
    gl.uniform4fv(colorLocation, color)

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES
    offset = 0
    var count = 6
    gl.drawArrays(primitiveType, offset, count)
  }

  canvas.onmousemove = function (e) {
    var x = e.pageX - width / 2
    var y = e.pageY - height / 2
    translation = [x, y]
    drawScene()
  }
}

// Fill the buffer with the values that define a rectangle.
function setRectangle (gl, x, y, width, height) {
  var x1 = x
  var x2 = x + width
  var y1 = y
  var y2 = y + height
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]),
    gl.STATIC_DRAW)
}

main()
