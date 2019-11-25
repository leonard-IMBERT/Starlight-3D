attribute vec4 aVertexPosition;

varying lowp vec4 vVertexPosition;

void main() {
  vVertexPosition = aVertexPosition;
  gl_Position = aVertexPosition;
  gl_Position.z = 1.0;
}