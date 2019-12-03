attribute vec4 aVertexPosition;
attribute vec2 aTexturePosition;

uniform mat4 uMatrix;

varying vec2 vTexturePosition;

void main() {
  gl_Position = uMatrix * aVertexPosition;
  vTexturePosition = aTexturePosition;
}