precision mediump float;

uniform samplerCube uSkybox;
uniform mat4 uViewDirectionProjectionInverse;

varying vec4 vVertexPosition;
void main() {
  vec4 t = uViewDirectionProjectionInverse * vVertexPosition;
  gl_FragColor = textureCube(uSkybox, normalize(t.xyz / t.w));
}