uniform float uSpeed;
varying vec2 vUv;
varying float vShift;

#include '../glsl/noise.glsl'

void main() {
  vec3 pos = position;
  vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  float dist = 1.0 - smoothstep(0.0, 0.7, abs(pos.y));
  float n = cnoise(worldPos * 2.0);
  float shift = uSpeed * (dist + n) * 0.001;
  pos.x -= shift;

  vUv = uv;
  vShift = shift;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}