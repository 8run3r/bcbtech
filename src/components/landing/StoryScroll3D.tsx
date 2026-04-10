/**
 * StoryScroll3D — Interactive 3D "bit world" journey.
 *
 * 5 stations along a 3D path. Each shows Pretext-computed words as glowing
 * points in a voxel world. User navigates between stations via click.
 * By the end, the user understands CokTech's full work process.
 */
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  preparePretextHandle,
  buildWordVertices,
  buildScatterPositions,
} from "@/lib/word-to-vertex";

/* ════════════════════════════════════════════
   Station data
═══════════════════════════════════════════ */
interface Station {
  title: string;
  subtitle: string;
  body: string;
  label: string;
  color: string;
  pos: [number, number, number];
}

const STATIONS: Station[] = [
  {
    title: "Konzultácia",
    subtitle: "01 / UNDERSTAND",
    body: "Stretneme sa. Pochopíme váš biznis, ciele a zákazníkov. Zanalyzujeme trh a navrhneme najefektívnejšie riešenie — nie najdrahšie.",
    label: "「相談」",
    color: "#00ffaa",
    pos: [0, 0, 0],
  },
  {
    title: "Stratégia",
    subtitle: "02 / DESIGN",
    body: "Vytvoríme wireframe, UX flow a vizuálny návrh. Vidíte presne čo dostanete ešte pred prvým riadkom kódu.",
    label: "「戦略」",
    color: "#00ffaa",
    pos: [7, 0.5, -8],
  },
  {
    title: "Vývoj",
    subtitle: "03 / BUILD",
    body: "Next.js, TypeScript, moderný stack. Staviame rýchlo, čisto a škálovateľne. Každý týždeň vidíte progres.",
    label: "「開発」",
    color: "#00ffaa",
    pos: [2, 1, -17],
  },
  {
    title: "Spustenie",
    subtitle: "04 / LAUNCH",
    body: "Testujeme na reálnych zariadeniach, optimalizujeme výkon, nasadíme na produkciu. Vy len schválite.",
    label: "「発射」",
    color: "#FF8C00",
    pos: [-5, 0.3, -25],
  },
  {
    title: "Podpora",
    subtitle: "05 / SCALE",
    body: "Neodchádzame. Monitoring, údržba, iterácie. Rastieme s vami. Vy sa staráte o biznis, my o tech.",
    label: "「支援」",
    color: "#FF8C00",
    pos: [0, 0.8, -33],
  },
];

/* ════════════════════════════════════════════
   Bit-world grid floor
═══════════════════════════════════════════ */
const GridFloor = () => (
  <gridHelper
    args={[80, 80, "#00ffaa", "#00ffaa"]}
    position={[0, -2, -16]}
    rotation={[0, 0, 0]}
    material-opacity={0.06}
    material-transparent
  />
);

/* ════════════════════════════════════════════
   Floating voxel cubes (bit-world aesthetic)
═══════════════════════════════════════════ */
const Voxels = () => {
  const positions = useMemo(
    () =>
      Array.from({ length: 60 }, () => [
        (Math.random() - 0.5) * 30,
        Math.random() * 4 - 1.5,
        Math.random() * -40,
      ] as [number, number, number]),
    []
  );
  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={0.4 + Math.random() * 0.5} floatIntensity={0.2} rotationIntensity={0.1}>
          <mesh position={pos} scale={0.06 + Math.random() * 0.12}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#00ffaa" : i % 3 === 1 ? "#FF8C00" : "#333"}
              emissive={i % 3 === 0 ? "#00ffaa" : i % 3 === 1 ? "#FF8C00" : "#111"}
              emissiveIntensity={i % 3 === 2 ? 0 : 0.4}
              roughness={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

/* ════════════════════════════════════════════
   Station title as 3D Points (Pretext → GPU)
═══════════════════════════════════════════ */
const WORD_VERT = /* glsl */ `
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

const WORD_FRAG = /* glsl */ `
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

const StationTitle = ({
  text,
  color,
  stationPos,
}: {
  text: string;
  color: string;
  stationPos: [number, number, number];
}) => {
  const meshRef = useRef<THREE.Points>(null!);

  const { geometry, uniforms } = useMemo(() => {
    if (typeof window === "undefined")
      return { geometry: new THREE.BufferGeometry(), uniforms: {} };

    const fontSize = 48;
    const lh = 58;
    const prepared = preparePretextHandle(text, fontSize);
    // Use 400px width → NDC → 3D scale
    const { ndcPositions, wordData } = buildWordVertices(prepared, 400, fontSize, lh);

    const count = wordData.length;
    const delays = new Float32Array(count);
    for (let i = 0; i < count; i++) delays[i] = i / Math.max(count - 1, 1);

    const geo = new THREE.BufferGeometry();
    // Scale NDC → 3D units (spread about 4 units wide)
    const scaled = ndcPositions.slice();
    for (let i = 0; i < count; i++) {
      scaled[i * 3] *= 2;
      scaled[i * 3 + 1] *= 0.8;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(scaled, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));

    const unifs = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    };
    return { geometry: geo, uniforms: unifs };
  }, [text, color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += delta;
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: WORD_VERT,
        fragmentShader: WORD_FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms]
  );

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[stationPos[0] - 1.5, stationPos[1] + 1.2, stationPos[2]]}
    />
  );
};

/* ════════════════════════════════════════════
   Camera controller
═══════════════════════════════════════════ */
const CameraRig = ({ targetIdx }: { targetIdx: number }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    const s = STATIONS[targetIdx];
    targetPos.current.set(s.pos[0], s.pos[1] + 0.5, s.pos[2] + 5);
    lookTarget.current.set(s.pos[0], s.pos[1], s.pos[2]);

    camera.position.lerp(targetPos.current, 0.035);
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const desiredLook = lookTarget.current.clone().sub(camera.position).normalize();
    const blended = currentLook.lerp(desiredLook, 0.04);
    camera.lookAt(camera.position.clone().add(blended));
  });

  return null;
};

/* ════════════════════════════════════════════
   Main Scene
═══════════════════════════════════════════ */
const Scene3D = ({ currentStation }: { currentStation: number }) => (
  <>
    <ambientLight intensity={0.25} />
    <pointLight position={[0, 4, 0]} intensity={0.5} color="#00ffaa" />
    <pointLight position={[-3, 2, -20]} intensity={0.4} color="#FF8C00" />
    <fog attach="fog" args={["#050508", 6, 35]} />

    <GridFloor />
    <Voxels />

    {STATIONS.map((s, i) => (
      <StationTitle key={i} text={s.title} color={s.color} stationPos={s.pos} />
    ))}

    <CameraRig targetIdx={currentStation} />
  </>
);

/* ════════════════════════════════════════════
   DOM Overlay
═══════════════════════════════════════════ */
const StationOverlay = ({ station, index }: { station: Station; index: number }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, x: -24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 24 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    className="absolute bottom-16 md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-6 md:left-12 z-20 max-w-sm pointer-events-none"
  >
    <div
      className="rounded-sm px-6 py-5"
      style={{
        background: "rgba(5,5,8,0.72)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        className="font-mono text-xs mb-1 tracking-widest"
        style={{ color: station.color, fontFamily: "'JetBrains Mono',monospace" }}
      >
        {station.subtitle}
      </p>
      <p
        className="font-mono text-xs mb-3"
        style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}
      >
        {station.label}
      </p>
      <h3
        className="font-bold text-xl mb-2"
        style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}
      >
        {station.title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ fontFamily: "'DM Sans',sans-serif", color: "var(--text-muted)" }}
      >
        {station.body}
      </p>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════
   Navigation dots
═══════════════════════════════════════════ */
const NavDots = ({
  current,
  onChange,
}: {
  current: number;
  onChange: (i: number) => void;
}) => (
  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pointer-events-auto">
    {STATIONS.map((s, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className="group flex flex-col items-center gap-1 transition-all"
        aria-label={`Go to ${s.title}`}
      >
        <span
          className="font-mono transition-all duration-300"
          style={{
            fontSize: 9,
            color: i === current ? s.color : "var(--text-muted)",
            opacity: i === current ? 1 : 0.5,
            fontFamily: "'JetBrains Mono',monospace",
          }}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <span
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            height: 4,
            background: i === current ? s.color : "rgba(255,255,255,0.15)",
          }}
        />
      </button>
    ))}
  </div>
);

/* ════════════════════════════════════════════
   Arrow keys + side click hints
═══════════════════════════════════════════ */
const ArrowHints = ({
  current,
  onPrev,
  onNext,
}: {
  current: number;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <>
    {current > 0 && (
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 font-mono text-xl opacity-40 hover:opacity-100 transition-opacity pointer-events-auto"
        style={{ color: STATIONS[current].color }}
        aria-label="Previous"
      >
        ‹
      </button>
    )}
    {current < STATIONS.length - 1 && (
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 font-mono text-xl opacity-40 hover:opacity-100 transition-opacity pointer-events-auto"
        style={{ color: STATIONS[current].color }}
        aria-label="Next"
      >
        ›
      </button>
    )}
  </>
);

/* ════════════════════════════════════════════
   Main export
═══════════════════════════════════════════ */
const StoryScroll3D = () => {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (i: number) => setCurrent(Math.max(0, Math.min(i, STATIONS.length - 1))),
    []
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(current + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goTo]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: "100vh", minHeight: 500, background: "#050508" }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-[40]"
        style={{
          background:
            "repeating-linear-gradient(transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* HUD corners */}
      {["top-4 left-4 border-t border-l", "top-4 right-4 border-t border-r", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map(
        (cls, i) => (
          <span
            key={i}
            className={`absolute w-5 h-5 pointer-events-none z-30 ${cls}`}
            style={{ borderColor: `${STATIONS[current].color}44` }}
          />
        )
      )}

      {/* Three.js canvas */}
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene3D currentStation={current} />
      </Canvas>

      {/* DOM overlay */}
      <AnimatePresence mode="wait">
        <StationOverlay station={STATIONS[current]} index={current} />
      </AnimatePresence>

      {/* Nav */}
      <NavDots current={current} onChange={goTo} />
      <ArrowHints
        current={current}
        onPrev={() => goTo(current - 1)}
        onNext={() => goTo(current + 1)}
      />

      {/* Top-right station counter */}
      <div
        className="absolute top-6 right-6 z-30 font-mono"
        style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10,
          color: STATIONS[current].color,
          opacity: 0.6,
        }}
      >
        {String(current + 1).padStart(2, "0")} / {String(STATIONS.length).padStart(2, "0")}
      </div>
    </section>
  );
};

export default StoryScroll3D;
