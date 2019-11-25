export default class Square {
  /**
   * @param {WebGLRenderingContext} ctx The context of the square
   */
  constructor(ctx) {
    this.ctx = ctx;

    this.position = ctx.createBuffer();

    this.rotation = 0.0;

    const colors = [
      1.0, 1.0, 1.0, 1.0, // white
      1.0, 0.0, 0.0, 1.0, // red
      0.0, 1.0, 0.0, 1.0, // green
      0.0, 0.0, 1.0, 1.0, // blue
    ];
    const position = [
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ];

    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.position);


    ctx.bufferData(
      ctx.ARRAY_BUFFER,
      new Float32Array(position),
      ctx.STATIC_DRAW,
    );

    this.colors = ctx.createBuffer();

    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.colors);
    ctx.bufferData(
      ctx.ARRAY_BUFFER,
      new Float32Array(colors),
      ctx.STATIC_DRAW,
    );
  }
}
