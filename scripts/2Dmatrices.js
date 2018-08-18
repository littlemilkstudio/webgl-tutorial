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
  gl.useProgram(program)

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, 'a_position')

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  var translationLocation = gl.getUniformLocation(program, 'u_translation')
  var rotationLocation = gl.getUniformLocation(program, 'u_rotation')
  var scaleLocation = gl.getUniformLocation(program, 'u_scale')
  var colorLocation = gl.getUniformLocation(program, 'u_color')

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer()
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  // Put geometry data into buffer
  setGeometry(gl)

  var translation = [100, 150]
  var angleInDegrees = 30
  var angleInRadians = angleInDegrees * Math.PI / 180
  var rotation = [0, 0]
  rotation[0] = Math.sin(angleInRadians)
  rotation[1] = Math.cos(angleInRadians)
  var scale = [1, 1]
  var color = [Math.random(), Math.random(), Math.random(), 1]

  drawScene()

  // Draw a the scene.
  function drawScene () {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Tell it to use our pair of shaders
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation)

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
    // set the translation
    gl.uniform2fv(translationLocation, translation)
    // Set the rotation
    gl.uniform2fv(rotationLocation, rotation)
    // Set the scale
    gl.uniform2fv(scaleLocation, scale)

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES
    offset = 0
    var count = 18 // 6 triangles in the 'F', 3 pts per triangle
    gl.drawArrays(primitiveType, offset, count)
  }

  canvas.onmousemove = function (e) {
    var x = e.pageX
    var y = e.pageY
    translation = [x, y]
    drawScene()
  }
}

// Fill the buffer with the values that define the letter 'F'
function setGeometry (gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0, 0,
      30, 0,
      0, 150,
      0, 150,
      30, 0,
      30, 150,

      30, 0,
      100, 0,
      30, 30,
      30, 30,
      100, 0,
      100, 30,

      30, 60,
      67, 60,
      30, 90,
      30, 90,
      67, 60,
      67, 90
    ]),
    gl.STATIC_DRAW)
}

main()
