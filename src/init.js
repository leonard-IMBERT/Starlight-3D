const VERTEX_SHADER = require('./shaders/vertex.glsl');
const FRAG_SHADER = require('./shaders/fragment.glsl');

const SKY_VERTEX_SHADER = require('./shaders/skybox/vertex.glsl');
const SKY_FRAG_SHADER = require('./shaders/skybox/fragment.glsl');

/**
 * Initialize a context
 * @param {WebGLRenderingContext} ctx The context to initialize
 */
export function InitContext(ctx) {
  ctx.clearColor(0.0, 0.0, 0.0, 1.0);
  ctx.clearDepth(1.0);
  ctx.enable(ctx.DEPTH_TEST);
  ctx.depthFunc(ctx.LEQUAL);
}

/**
 * Load a shader in the context
 * @param {WebGLRenderingContext} ctx The context
 * @param {number} type The shader type
 * @param {string} source The source of the shader
 */
export function loadShader(ctx, type, source) {
  const shader = ctx.createShader(type);

  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);

  if (ctx.getShaderParameter(shader, ctx.COMPILE_STATUS) === false) {
    console.warn(ctx.getShaderInfoLog(shader));
    console.error(`There was an error while compiling the shader: ${source}`);
    ctx.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Initialize the shaders in the context
 * @param {WebGLRenderingContext} ctx The context to intialize
 */
export function InitShaders(ctx) {
  const vertexShader = loadShader(ctx, ctx.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = loadShader(ctx, ctx.FRAGMENT_SHADER, FRAG_SHADER);

  const shaderProgram = ctx.createProgram();

  ctx.attachShader(shaderProgram, vertexShader);
  ctx.attachShader(shaderProgram, fragmentShader);

  ctx.linkProgram(shaderProgram);

  if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS)) {
    console.error('Got an error while initializing the program');
    return null;
  }

  return shaderProgram;
}

/**
 * Initialize the shaders in the context for te skybox
 * @param {WebGLRenderingContext} ctx The context to intialize
 */
export function InitSkyboxShader(ctx) {
  const vertexShader = loadShader(ctx, ctx.VERTEX_SHADER, SKY_VERTEX_SHADER);
  const fragmentShader = loadShader(ctx, ctx.FRAGMENT_SHADER, SKY_FRAG_SHADER);

  const program = ctx.createProgram();

  ctx.attachShader(program, vertexShader);
  ctx.attachShader(program, fragmentShader);

  ctx.linkProgram(program);

  if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    console.error('Got an error while initializing the program for skybox');
    return null;
  }

  return program;
}
