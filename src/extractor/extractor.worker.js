import { loadShader, InitContext } from '../init';
import m4 from '../tools/m4';
import { Clear } from '../draw';
/**
 * An object containing usefull data about the map
 * @typedef {Object} Metadata
 */

/**
 * The metadata of the map
 * @type {Metadata}
 */
const metadata = require('../metadata.json');

const imageUrl = '/map.png';
/**
 * @type {string} The vertex shader code
 */
const VERTEX_SHADER = require('../shaders/worker/workerVertex.glsl');
/**
 * @type {string} The fragment shader code
 */
const FRAGMENT_SHADER = require('../shaders/worker/workerFragment.glsl');

/**
 * Object containing informations about the vertices and the texture of the map
 *
 * The map is casted on a flat plane with an ismetric view
 */
const flatMap = {
  /**
   * The position of the vertices of the plane
   */
  position: [
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
  ],
  /**
   * Where each vertices should be on the texture
   */
  textureCoord: [
    0, 1,
    1, 1,
    0, 0,
    1, 0,
  ],
};

/**
 * Decode and draw the map on the offscreen canvas
 */
const decode = async () => {
  // ========================= Load Image =====================
  const image = await fetch(imageUrl);
  const blob = await image.blob();
  const bitmap = await createImageBitmap(blob);

  // Here using Offscreen canvas because web worker cannot use real canvas
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

  // ===================== Create webgl program ====================

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  const buffer = {
    position: gl.createBuffer(),
    texture: gl.createTexture(),
    textureCoord: gl.createBuffer(),
  };

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatMap.position), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.textureCoord);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatMap.textureCoord), gl.STATIC_DRAW);

  gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);


  // Because the map is has not dimension of power of two (512, 1024, ...) we must do this
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    gl.CLAMP_TO_EDGE,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    gl.CLAMP_TO_EDGE,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR,
  );

  const location = {
    attributes: {
      vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      texturePosition: gl.getAttribLocation(program, 'aTexturePosition'),
    },
    uniform: {
      matrix: gl.getUniformLocation(program, 'uMatrix'),
      texture: gl.getUniformLocation(program, 'uTexture'),
    },
  };

  const perspective = m4.orthographic(-1, 1, -1, 1, 0.1, 1000);
  const view = m4.translate(perspective, 0, 0, -1);

  // =================== Initialization des attribus ==================

  InitContext(gl);
  Clear(gl);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
  gl.vertexAttribPointer(location.attributes.vertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(location.attributes.vertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.textureCoord);
  gl.vertexAttribPointer(location.attributes.texturePosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(location.attributes.texturePosition);

  gl.useProgram(program);

  gl.uniformMatrix4fv(location.uniform.matrix, false, new Float32Array(view));

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
  gl.uniform1i(location.uniform.texture, 0);

  // ============ Draw =================

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  return { canvas, gl };
};

// call the decode function
const prom = decode();

/**
 * Read the map for a tile
 * @param {number} x The x coordinate of the tile
 * @param {number} y The y coordinate of the tile
 */
const read = (x, y) => prom.then((cont) => {
  const { gl } = cont;

  if (y < 0 || y > 70 || x < 0 || x > metadata['row-length'][x + 1]) {
    throw new Error('Coordinates out of bound');
  }


  const pixy = metadata['bottom-offset'] + y * metadata['vertical-step'];
  const pixx = metadata['left-offset'][y + 1] + x * metadata['horizontal-step'];

  const bufferImage = new Uint8Array(27 * 15 * 4);

  gl.readPixels(pixx - 13, pixy - 7, 27, 15, gl.RGBA, gl.UNSIGNED_BYTE, bufferImage);

  return bufferImage;
});


onmessage = (event) => {
  const { x, y } = event.data;

  if (x == null || y == null) {
    throw new Error('Malformed message');
  }

  read(x, y).then((bufferImage) => {
    postMessage({
      data: Array.from(bufferImage),
      width: 27,
      height: 15,
      x,
      y,
    });
  });
};
