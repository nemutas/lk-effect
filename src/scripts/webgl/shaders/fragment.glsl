uniform sampler2D tImage;
uniform vec2 uCoveredScale;
uniform float uTime;
uniform float uProgress;
uniform float uAspect;
varying vec2 vUv;
varying float vShift;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float parabola(float x, float k) {
  return pow(4. * x * (1. - x), k);
}

#include '../glsl/noise.glsl'

void main() {
  vec2 uv = (vUv - 0.5) * uCoveredScale + 0.5;

  float n = cnoise(vec3(uv * 5.0, uTime));

  vec2 aspect = vec2(uAspect, 1.0);
  float dist = distance(uv * aspect, vec2(0.5) * aspect) + n * 0.05;
  // 範囲
  float progress = uProgress * 1.2;
  float d = smoothstep(progress - 0.5, progress, dist);
  float range = parabola(d, 1.5);
  // 向き
  vec2 dir = normalize(uv - vec2(0.5));
  dir *= smoothstep(uProgress - 0.1, uProgress - 0.2, dist) * 2.0 - 1.0;
  // dir *= smoothstep(uProgress - 0.1, uProgress - 0.2, dist) * 3.0 - 2.0;
  vec2 distortion = dir * range * dist * 0.5;
  // 波
  float w = sin(dist * 30.0 - uTime * 10.0);
  float wd = smoothstep(0.0, 0.1, dist);
  vec2 wave = dir * w * wd * uProgress * 0.01;
  // texture参照
  // vec4 tex = texture2D(tImage, uv - distortion - wave);
  float tR = texture2D(tImage, uv - distortion - wave + vShift * 0.0).r;
  float tG = texture2D(tImage, uv - distortion - wave + vShift * 0.1).g;
  float tB = texture2D(tImage, uv - distortion - wave + vShift * 0.2).b;
  vec3 color = vec3(tR, tG, tB);
  // 輝度
  float l = luma(color) * parabola(uProgress, 3.0);
  color *= (1.0 + l * 5.0);

  // float gray = luma(tex.rgb);
  // vec3 final = mix(tex.rgb, vec3(gray), d);
    
  // gl_FragColor = vec4(final, 1.0);
  gl_FragColor = vec4(color, 1.0);
}