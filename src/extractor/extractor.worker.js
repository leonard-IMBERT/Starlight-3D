import { loadShader, InitContext } from '../init';
import m4 from '../tools/m4';
import { Clear } from '../draw';

const metadata = require('../metadata.json');

const imageUrl = '/map.png';

const VERTEX_SHADER = require('../shaders/worker/workerVertex.glsl');
const FRAGMENT_SHADER = require('../shaders/worker/workerFragment.glsl');

const flatMap = {
  position: [
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
  ],
  textureCoord: [
    0, 1,
    1, 1,
    0, 0,
    1, 0,
  ],
};

const decode = async () => {
  // ========================= Load Image =====================
  console.log('decoding');
  const image = await fetch(imageUrl);
  console.log('image downloaded');
  const blob = await image.blob();
  console.log('blob fetched');
  const bitmap = await createImageBitmap(blob);
  console.log('bitmap created');

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  console.log('canvas created');
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  console.log('Context created');

  // ===================== Create webgl program ====================

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  console.log('Program linked');

  const buffer = {
    position: gl.createBuffer(),
    texture: gl.createTexture(),
    textureCoord: gl.createBuffer(),
  };

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatMap.position), gl.STATIC_DRAW);

  console.log('buffering position');

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.textureCoord);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatMap.textureCoord), gl.STATIC_DRAW);

  console.log('buffering texcoord');

  gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);


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

  console.log('buffering tex');

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

  console.log('Program created');

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

  console.log('Program initialized');

  // ============ Draw =================

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  console.log('Bitmap drawed');

  console.log('Image loaded !');

  return { canvas, gl };
};

const prom = decode();

const read = async (x, y) => {
  if (x == null || y == null) {
    throw new Error('Malformed message');
  }
  return prom.then((cont) => {
    const { gl } = cont;

    if (y < 0 || y > 70 || x < 0 || x > metadata['row-length'][x + 1]) {
      throw new Error('coordinate out of bound');
    }


    const pixy = metadata['bottom-offset'] + y * metadata['vertical-step'];
    const pixx = metadata['left-offset'][y + 1] + x * metadata['horizontal-step'];


    /**
     * search around the center for 15x15 and select them
     */

    const bufferImage = new Uint8Array(27 * 15 * 4);

    gl.readPixels(pixx - 13, pixy - 7, 27, 15, gl.RGBA, gl.UNSIGNED_BYTE, bufferImage);

    return bufferImage;
  });
};

onmessage = (event) => {
  const { x, y } = event.data;

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
