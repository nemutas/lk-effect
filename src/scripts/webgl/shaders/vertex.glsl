uniform float uSpeed;
varying vec2 vUv;
varying float vShift;

#include '../glsl/noise.glsl'

void main() {
  vUv = uv;
  vec3 pos = position;
  float dist = 1.0 - smoothstep(0.0, 0.7, abs(pos.y));
  float n = cnoise((modelMatrix * vec4(pos, 1.0)).xyz * 2.0);
  vShift = uSpeed * (dist + n) * 0.001;
  pos.x -= vShift;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}