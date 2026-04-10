/**
 * WordScatter — Three.js Points-based word scatter effect.
 *
 * Phase 0: words arrive from random scatter positions
 * Phase 1: words hold their Pretext-computed positions
 * Phase 2 (optional loop): subtle float / drift
 *
 * Shader uses gl_PointSize so each "word" is one glowing disc.
 * After the animation, the parent should layer real DOM text on top.
 */
import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  preparePretextHandle,
  buildWordVertices,
  buildScatterPositions,
} from "@/lib/word-to-vertex";

/* ── Vertex shader ── */
const VERT = /* glsl */ `
uniform float uProgress;
uniform float uTime;
attribute vec3 aScatter;
attribute float aDelay;
varying float vAlpha;

void main() {
  // Per-word easing: smooth-step with staggered delay
  float t = clamp((uProgress - aDelay) / (1.0 - aDelay + 0.001), 0.0, 1.0);
  float eased = t * t * (3.0 - 2.0 * t); // smoothstep

  vec3 pos = mix(aScatter, position, eased);

  // Subtle drift once settled
  float drift = (1.0 - eased) * 0.0 + eased * sin(uTime * 0.8 + aDelay * 12.0) * 0.008;
  pos.y += drift;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (6.0 + eased * 4.0) * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
  vAlpha = eased;
}
`;

/* ── Fragment shader ── */
const FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  // Circular soft disc
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  if (r > 0.5) discard;

  float core = 1.0 - smoothstep(0.0, 0.18, r);
  float halo = 1.0 - smoothstep(0.18, 0.5, r);
  float brightness = core * 1.8 + halo * 0.6;

  gl_FragColor = vec4(uColor * brightness, (core * 0.95 + halo * 0.4) * vAlpha);
}
`;

interface PointsSceneProps {
  text: string;
  fontSize: number;
  lineHeight: number;
  color: THREE.Color;
  onDone: () => void;
}

const PointsScene = ({ text, fontSize, lineHeight, color, onDone }: PointsSceneProps) => {
  const { size } = useThree();
  const meshRef = useRef<THREE.Points>(null!);
  const progressRef = useRef(0);
  const doneFired = useRef(false);

  const { geometry, uniforms } = useMemo(() => {
    if (typeof window === "undefined")
      return { geometry: new THREE.BufferGeometry(), uniforms: {} };

    // Scale font size by canvas pixel width (approximate)
    const scaledFont = fontSize;
    const containerW = size.width;
    const prepared = preparePretextHandle(text, scaledFont);
    const { ndcPositions, wordData } = buildWordVertices(
      prepared,
      containerW,
      scaledFont,
      lineHeight
    );

    const count = wordData.length;
    const scatter = buildScatterPositions(count, 2.8);

    // Per-word stagger delay: spread 0 → 0.6
    const delays = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      delays[i] = (i / Math.max(count - 1, 1)) * 0.55;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(ndcPositions.slice(), 3));
    geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));

    const unifs = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: color },
    };

    return { geometry: geo, uniforms: unifs };
  }, [text, fontSize, lineHeight, size.width, color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value += delta;

    progressRef.current = Math.min(progressRef.current + delta * 0.72, 1);
    mat.uniforms.uProgress.value = progressRef.current;

    if (progressRef.current >= 0.98 && !doneFired.current) {
      doneFired.current = true;
      onDone();
    }
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms]
  );

  return <points ref={meshRef} geometry={geometry} material={material} />;
};

interface WordScatterProps {
  text: string;
  fontSize?: number;
  lineHeightPx?: number;
  color?: string;
  className?: string;
  onSettled?: () => void;
}

/**
 * Renders a Three.js canvas where words appear as glowing particles
 * that scatter→converge to their Pretext-computed positions.
 */
const WordScatter = ({
  text,
  fontSize = 64,
  lineHeightPx,
  color = "#00ffaa",
  className = "",
  onSettled,
}: WordScatterProps) => {
  const lh = lineHeightPx ?? Math.round(fontSize * 1.2);
  const [mounted, setMounted] = useState(false);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className={className} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <PointsScene
          text={text}
          fontSize={fontSize}
          lineHeight={lh}
          color={threeColor}
          onDone={onSettled ?? (() => {})}
        />
      </Canvas>
    </div>
  );
};

export default WordScatter;
