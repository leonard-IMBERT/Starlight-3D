/* eslint-disable no-unused-vars */
import Tile from './shapes/Tile';
import Info from './tools/info';
/* eslint-enable no-unused-vars */

const mat4 = require('gl-matrix/mat4');

/**
 * Draw the buffers in the context
 * @param {WebGLRenderingContext} ctx The context
 * @param {Info} infos The infos
 * @param {Tile} buffers The buffers to draw
 * @param {WebGLTexture} texure The texture
 * @param {{up: number, right: number, zoom: number}} rotation The rotation matrix to apply
 */
export default function Draw(ctx, infos, buffers, texure, rotation) {
  const fov = (45 * Math.PI) / 180;

  const aspect = ctx.canvas.clientWidth / ctx.canvas.clientHeight;

  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(
    projectionMatrix,
    fov,
    aspect,
    zNear,
    zFar,
  );

  const modelViewMatrix = mat4.create();

  mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    [0.0, -10.0, -70.0 * rotation.zoom],
  );

  mat4.rotate(modelViewMatrix, modelViewMatrix, rotation.up - Math.PI / 3, [1, 0, 0]);

  mat4.rotate(modelViewMatrix, modelViewMatrix, rotation.right * 0.1, [0, 0, 1]);

  // Configure shape
  {
    const numConponent = 3;
    const type = ctx.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffers.position);
    ctx.vertexAttribPointer(
      infos.attribLocations.vertexPosition,
      numConponent,
      type,
      normalize,
      stride,
      offset,
    );
    ctx.enableVertexAttribArray(infos.attribLocations.vertexPosition);
  }

  /* // Configure color
  {
    const numConponent = 4;
    const type = ctx.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffers.colors);
    ctx.vertexAttribPointer(
      infos.attribLocations.vertexColor,
      numConponent,
      type,
      normalize,
      stride,
      offset,
    );
    ctx.enableVertexAttribArray(infos.attribLocations.vertexColor);
  } */

  // Configuring texures
  {
    const num = 2;
    const type = ctx.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffers.textures);
    ctx.vertexAttribPointer(infos.attribLocations.textureCoord,
      num, type, normalize, stride, offset);
    ctx.enableVertexAttribArray(infos.attribLocations.textureCoord);
  }

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, buffers.index);

  ctx.useProgram(infos.program);

  ctx.uniformMatrix4fv(
    infos.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );

  ctx.uniformMatrix4fv(
    infos.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, texure);
  ctx.uniform1i(infos.uniformLocations.uSampler, 0);

  {
    const vertexCount = 72;
    const type = ctx.UNSIGNED_SHORT;
    const offset = 0;
    ctx.drawElements(ctx.TRIANGLES, vertexCount, type, offset);
  }
}

export function Clear(ctx) {
  /* eslint-disable no-bitwise */
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
}
