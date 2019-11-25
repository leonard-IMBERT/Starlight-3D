import { InitSkyboxShader } from '../init';

const mat4 = require('gl-matrix/mat4');

export default class Skybox {
  /**
   * @param {WebGLRenderingContext} ctx The context of the skybox
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.positions = ctx.createBuffer();
    const positions = [
      -50, -50,
      50, -50,
      -50, 50,
      -50, 50,
      50, -50,
      50, 50,
    ];
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.positions);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(positions), ctx.STATIC_DRAW);

    this.program = InitSkyboxShader(this.ctx);

    this.locations = {
      attributes: {
        vertexPosition: this.ctx.getAttribLocation(this.program, 'aVertexPosition'),
      },
      uniform: {
        skybox: this.ctx.getUniformLocation(this.program, 'uSkybox'),
        view: this.ctx.getUniformLocation(this.program, 'uViewDirectionProjectionInverse'),
      },
    };

    this.texture = this.ctx.createTexture();
    this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, this.texture);

    const faces = [
      {
        targets: [this.ctx.TEXTURE_CUBE_MAP_POSITIVE_Y],
        url: '/skybox-sky.jpg',
      },
      {
        targets: [
          this.ctx.TEXTURE_CUBE_MAP_POSITIVE_X,
          this.ctx.TEXTURE_CUBE_MAP_POSITIVE_Z,
          this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_X,
          this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ],
        url: '/skybox-face.jpg',
      },
      {
        targets: [
          this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        ],
        url: '/skybox-sea.jpg',
      },
    ];

    faces.forEach((faceInfo) => {
      const { targets, url } = faceInfo;

      const level = 0;
      const internalFormat = this.ctx.RGBA;
      const width = 512;
      const height = 512;
      const format = this.ctx.RGBA;
      const type = this.ctx.UNSIGNED_BYTE;

      const image = new Image();
      image.src = url;

      // setup each face so it's immediately renderable
      targets.forEach((target) => {
        this.ctx.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
      });

      image.decode().then(() => {
        targets.forEach((target) => {
          this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, this.texture);
          this.ctx.texImage2D(target, level, internalFormat, format, type, image);
          this.ctx.generateMipmap(this.ctx.TEXTURE_CUBE_MAP);
        });
      });
    });
    this.ctx.generateMipmap(this.ctx.TEXTURE_CUBE_MAP);
    this.ctx.texParameteri(
      this.ctx.TEXTURE_CUBE_MAP,
      this.ctx.TEXTURE_MIN_FILTER,
      this.ctx.LINEAR_MIPMAP_LINEAR,
    );
  }

  draw(orientation) {
    this.ctx.useProgram(this.program);

    {
      const size = 2;
      const type = this.ctx.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positions);
      this.ctx.vertexAttribPointer(
        this.locations.attributes.vertexPosition,
        size,
        type,
        normalize,
        stride,
        offset,
      );
      this.ctx.enableVertexAttribArray(
        this.locations.attributes.vertexPosition,
      );
    }

    const aspect = this.ctx.canvas.clientWidth / this.ctx.canvas.clientHeight;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, (45 * Math.PI) / 180, aspect, 1, 2000);

    const camPos = [Math.cos(orientation * 0.1), 0, Math.sin(orientation * 0.1)];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const cameraMatrix = mat4.create();
    mat4.lookAt(cameraMatrix, camPos, target, up);

    const viewMatrix = mat4.create();
    mat4.invert(viewMatrix, cameraMatrix);

    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    const viewDirPro = mat4.create();
    mat4.multiply(viewDirPro, projectionMatrix, viewMatrix);
    const viewDirProInverse = mat4.create();
    mat4.invert(viewDirProInverse, viewDirPro);

    this.ctx.uniformMatrix4fv(
      this.locations.uniform.view, false, viewDirProInverse,
    );

    this.ctx.uniform1i(this.locations.uniform.skybox, 0);

    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 6);
  }
}
