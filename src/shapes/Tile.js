export default class Tile {
  /**
   * @param {number} posX The position x of the hexagon
   * @param {number} posY The position y of the hexagon
   * @param {WebGLRenderingContext} ctx The context to render in
   * @param {number} posZ The position z of the hexagon
   * @param {number} height The height of the hexagon
   * @param {size} size The radius of the hexagonal faces
   */
  constructor(ctx, posX, posY, posZ, height = 1, size = 1) {
    this.x = posX;
    this.y = posY;
    this.z = posZ;
    this.size = size;
    this.height = height;

    // =========== Defining position ============
    const position = [];

    /*
     * group index 0 - 5 bottom face
     * group index 6 bottom face center
    */

    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 180) * (60 * i + 30);
      const x = this.x + this.size * Math.cos(angle);
      const y = this.y + this.size * Math.sin(angle);
      position.push(x);
      position.push(y);
      position.push(-(height / 2) + this.z);
    }
    position.push(this.x);
    position.push(this.y);
    position.push(-(height / 2) + this.z);

    /*
     * group index 7 - 12 top face
     * group index 13 top face center
    */

    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 180) * (60 * i + 30);
      const x = this.x + this.size * Math.cos(angle);
      const y = this.y + this.size * Math.sin(angle);
      position.push(x);
      position.push(y);
      position.push(height / 2 + this.z);
    }

    position.push(this.x);
    position.push(this.y);
    position.push(height / 2 + this.z);

    const positionRound = position.map((x) => x * 1000).map(Math.round).map((x) => x / 1000);
    this.position = ctx.createBuffer();

    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.position);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(positionRound), ctx.STATIC_DRAW);

    // ========== Defining textures ===========
    this.textures = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.textures);

    const texturesCoordinates = [
      // Bottom
      0.5, 0.5,
      0.5, 0.5,
      0.5, 0.5,
      0.5, 0.5,
      0.5, 0.5,
      0.5, 0.5,
      0.5, 0.5,

      // Top
      1.0, 0.2,
      0.5, 0.0,
      0.0, 0.2,
      0.0, 0.8,
      0.5, 1.0,
      1.0, 0.8,
      0.5, 0.5,
    ];

    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(texturesCoordinates), ctx.STATIC_DRAW);

    // ========== Defining indices ============
    this.index = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.index);

    const indices = [
      // Bottom face
      1, 0, 6,
      2, 1, 6,
      3, 2, 6,
      4, 3, 6,
      4, 5, 6,
      0, 5, 6,
      // Top face
      7, 8, 13,
      9, 8, 13,
      10, 9, 13,
      11, 10, 13,
      12, 11, 13,
      7, 12, 13,
      // Side
      1, 0, 7, 8, 7, 1,
      2, 1, 8, 9, 8, 2,
      3, 2, 9, 10, 9, 3,
      4, 3, 10, 11, 10, 4,
      5, 4, 11, 12, 11, 5,
      0, 5, 12, 7, 12, 0,
    ];

    ctx.bufferData(
      ctx.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      ctx.STATIC_DRAW,
    );
  }
}
