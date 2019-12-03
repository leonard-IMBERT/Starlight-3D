precision mediump float;

varying vec2 vTexturePosition;

uniform sampler2D uTexture;

void main() {
  // gl_FragColor = texture2D(uTexture, vTexturePosition);
  gl_FragColor = vec4(1.0, 0, 0, 1.0);
}