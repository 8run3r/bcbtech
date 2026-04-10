export const WORD_VERT = /* glsl */ `
uniform float uTime;
attribute float aDelay;
varying float vAlpha;
void main() {
  float breathe = sin(uTime * 0.9 + aDelay * 8.0) * 0.015;
  vec3 p = position;
  p.y += breathe;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = 5.0 * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
  vAlpha = 1.0;
}
`;

export const WORD_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  if (r > 0.5) discard;
  float core = 1.0 - smoothstep(0.0, 0.2, r);
  float halo = 1.0 - smoothstep(0.2, 0.5, r);
  gl_FragColor = vec4(uColor * (core * 1.5 + halo * 0.5), (core + halo * 0.35) * vAlpha);
}
`;

export const COLLECTIBLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uHover;
varying vec3 vNormal;
varying float vFresnel;
void main() {
  vec3 p = position;
  p += normal * sin(uTime * 2.0 + position.y * 4.0) * 0.02 * uHover;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalMatrix * normal;
  vec3 viewDir = normalize(-mv.xyz);
  vFresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
  gl_Position = projectionMatrix * mv;
}
`;

export const COLLECTIBLE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uHover;
uniform float uCollected;
varying vec3 vNormal;
varying float vFresnel;
void main() {
  float rim = vFresnel * (0.6 + uHover * 0.4);
  vec3 col = uColor * (0.3 + rim * 1.2);
  float alpha = mix(0.4, 0.85, rim) * (1.0 - uCollected * 0.7);
  gl_FragColor = vec4(col, alpha);
}
`;

/* ── Draggable model shaders (Spline-inspired) ── */
export const DRAGGABLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uHover;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vFresnel;
varying vec3 vPosition;
void main() {
  vec3 p = position;
  // Subtle vertex displacement on hover
  float wave = sin(uTime * 1.5 + p.x * 3.0 + p.y * 2.0 + p.z * 4.0) * 0.015;
  p += normal * wave * uHover;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vFresnel = pow(1.0 - abs(dot(vViewDir, vNormal)), 3.0);
  vPosition = p;
  gl_Position = projectionMatrix * mv;
}
`;

export const DRAGGABLE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uHover;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vFresnel;
varying vec3 vPosition;
void main() {
  // Base color — darkened interior
  vec3 base = uColor * 0.15;
  // Rim/fresnel glow
  float rim = vFresnel * (0.8 + uHover * 0.5);
  // Subtle scan line across surface
  float scan = smoothstep(0.48, 0.5, fract(vPosition.y * 3.0 + uTime * 0.2)) * 0.08;
  // Holographic shimmer
  float shimmer = sin(vPosition.x * 10.0 + vPosition.y * 8.0 + uTime * 2.0) * 0.03 * uHover;

  vec3 col = base + uColor * (rim * 1.4 + scan + shimmer);
  // Edge highlight
  col += uColor * pow(rim, 4.0) * 0.6;

  float alpha = mix(0.35, 0.92, rim);
  // Boost alpha on hover
  alpha = mix(alpha, min(alpha + 0.15, 1.0), uHover);

  gl_FragColor = vec4(col, alpha);
}
`;
