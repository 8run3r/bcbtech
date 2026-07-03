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

/* ── Atmospheric dust particles (igloo-style depth haze) ── */
export const ATMOSPHERE_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSize;
attribute float aPhase;
attribute float aSpeed;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.06 * aSpeed + aPhase) * 1.2;
  p.z += cos(uTime * 0.05 * aSpeed + aPhase * 1.7) * 1.2;
  p.y += sin(uTime * 0.04 * aSpeed + aPhase * 2.3) * 0.8;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  gl_PointSize = aSize * uPixelRatio * (90.0 / max(dist, 0.1));
  float nearFade = smoothstep(2.0, 5.0, dist);
  float farFade = 1.0 - smoothstep(14.0, 24.0, dist);
  vAlpha = nearFade * farFade;
  gl_Position = projectionMatrix * mv;
}
`;

export const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  if (r > 0.5) discard;
  float soft = 1.0 - smoothstep(0.05, 0.5, r);
  gl_FragColor = vec4(uColor, soft * vAlpha * 0.35);
}
`;

/* ── Fullscreen post overlay — film grain + vignette (no EffectComposer needed) ── */
export const POSTFX_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const POSTFX_FRAG = /* glsl */ `
uniform float uTime;
uniform float uGrain;
uniform float uVignette;
uniform float uSpeed;
varying vec2 vUv;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
void main() {
  vec2 c = vUv - 0.5;
  // Vignette tightens and grain intensifies with camera speed (transit whoosh)
  float vig = smoothstep(0.32, 0.92, length(c) * (1.3 + uSpeed * 0.35)) * (uVignette + uSpeed * 0.2);
  float g = hash(vUv * 1024.0 + vec2(fract(uTime * 7.31) * 100.0)) - 0.5;
  float dark = max(-g, 0.0) * uGrain * (1.0 + uSpeed * 2.0);
  float alpha = clamp(vig + dark, 0.0, 0.85);
  gl_FragColor = vec4(vec3(0.0), alpha);
}
`;

/* ── Draggable model shaders (Spline-inspired) ── */
export const DRAGGABLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uHover;
uniform float uReveal;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vFresnel;
varying vec3 vPosition;
varying float vReveal;
float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}
void main() {
  vec3 p = position;
  // Subtle vertex displacement on hover
  float wave = sin(uTime * 1.5 + p.x * 3.0 + p.y * 2.0 + p.z * 4.0) * 0.015;
  p += normal * wave * uHover;
  // Particle assembly — vertices scatter outward until the station reveals
  float h = hash3(position);
  float scatter = 1.0 - uReveal;
  vec3 dir = normalize(normal + vec3(h - 0.5, fract(h * 7.31) - 0.5, fract(h * 3.17) - 0.5) * 1.4);
  p += dir * scatter * (0.5 + h * 2.4);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vFresnel = pow(1.0 - abs(dot(vViewDir, vNormal)), 3.0);
  vPosition = p;
  vReveal = uReveal;
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
varying float vReveal;
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
  // Assembly sparkle — fragments glow hotter while scattered
  col += uColor * (1.0 - vReveal) * 0.9;

  float alpha = mix(0.35, 0.92, rim);
  // Boost alpha on hover
  alpha = mix(alpha, min(alpha + 0.15, 1.0), uHover);
  // Fade fragments in as the model assembles
  alpha *= 0.08 + 0.92 * pow(vReveal, 1.4);

  gl_FragColor = vec4(col, alpha);
}
`;
