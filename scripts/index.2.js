'use strict'

function main () {
  var image = new Image()
  image.src = 'http://localhost:8081/leaves.jpg'
  image.onload = function () {
    render(image)
  }
}

function render (image) {
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
  var positionLocation = gl.getAttribLocation(program, 'a_position')
  var texcoordLocation = gl.getAttribLocation(program, 'a_texCoord')

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer()

  // Bind it to ARRAY_BUFFER
  // (Think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  // Set a rectangle the same size as the image
  setRectangle(gl, 0, 0, image.width, image.height)

  // Provide texture coordinates for the rectangle
  var texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]), gl.STATIC_DRAW)

  // Create a texture
  var texture = createAndSetupTexture(gl)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, 'u_resolution')

  webglUtils.resizeCanvasToDisplaySize(gl.canvas)

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // Turn on the attribute
  gl.enableVertexAttribArray(positionLocation)

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
    positionLocation,
    size,
    type,
    normalize,
    stride,
    offset
  )

  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(texcoordLocation)

  // Bind the texcoord buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)

  // Tell the attribute how to get data out of texcoordBuffer
  // (gl.ARRAY_BUFFER)
  size = 2 // 2 components per iteration
  type = gl.FLOAT
  normalize = false
  stride = 0
  offset = 0
  gl.vertexAttribPointer(
    texcoordLocation,
    size,
    type,
    normalize,
    stride,
    offset
  )

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

  // Set u_testureSize
  var textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize')
  var kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]')
  var kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight')
  gl.uniform2f(textureSizeLocation, image.width, image.height)

  // Set u_kernel

  var edgeDetectKernel = [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ]
  gl.uniform1fv(kernelLocation, edgeDetectKernel)
  gl.uniform1f(kernelWeightLocation, computeKernelWeight(edgeDetectKernel))

  // Draw the rectangle
  var primitiveType = gl.TRIANGLES
  offset = 0
  var count = 6
  gl.drawArrays(primitiveType, offset, count)
}

function createAndSetupTexture (gl) {
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // Set up texture so we ca render any size image
  // so we are working in pixels
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  return texture
}

function computeKernelWeight (kernel) {
  var weight = kernel.reduce(function (prev, curr) {
    return prev + curr
  })
  return weight <= 0 ? 1 : weight
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
