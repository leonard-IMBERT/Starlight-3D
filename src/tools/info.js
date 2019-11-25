export default class Info {
  /**
   * @param {WebGLRenderingContext} ctx The context of the program
   * @param {WebGLProgram} program The program to use
   */
  constructor(ctx, program) {
    this.program = program;
    this.attribLocations = {
      vertexPosition: ctx.getAttribLocation(program, 'aVertexPosition'),
      textureCoord: ctx.getAttribLocation(program, 'aTextureCoord'),
    };
    this.uniformLocations = {
      projectionMatrix: ctx.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: ctx.getUniformLocation(program, 'uModelViewMatrix'),
      uSampler: ctx.getUniformLocation(program, 'uSampler'),
    };
  }
}
