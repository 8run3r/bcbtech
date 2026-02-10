import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";

/* ─────────────────────────────────────────
   Story slides data
   ───────────────────────────────────────── */
interface StorySlide {
  label: string;
  heading: string;
  description: string;
  cameraPos: [number, number, number];
  cameraLookAt: [number, number, number];
}

const slides: StorySlide[] = [
  {
    label: "01",
    heading: "Vytvárame digitálne produkty",
    description:
      "Každý projekt začína otázkou — ako zlepšiť zážitok vašich používateľov? Odpoveď hľadáme v dizajne, technológii a strategickom myslení.",
    cameraPos: [0, 0, 5],
    cameraLookAt: [0, 0, 0],
  },
  {
    label: "02",
    heading: "Od vízie po realitu",
    description:
      "Posúvame nápady od prvého nástinu až po nasadenie. Iterujeme rýchlo, staviame kvalitne a dodávame na čas.",
    cameraPos: [3, 1.5, 3],
    cameraLookAt: [2, 0.5, -1],
  },
  {
    label: "03",
    heading: "Technológia s účelom",
    description:
      "Nepoužívame technológie len preto, že sú nové. Vyberáme tie, ktoré riešia váš konkrétny problém najefektívnejšie.",
    cameraPos: [-2.5, -1, 4],
    cameraLookAt: [-1.5, -0.5, 0],
  },
];

/* ─────────────────────────────────────────
   Vertex Node
   ───────────────────────────────────────── */
const VertexNode = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = position[0] + Math.sin(t * 0.3 + position[1]) * 0.12;
    ref.current.position.y = position[1] + Math.cos(t * 0.4 + position[0]) * 0.1;
    ref.current.position.z = position[2] + Math.sin(t * 0.2 + position[2]) * 0.08;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshStandardMaterial
        color="#00ffaa"
        emissive="#00ffaa"
        emissiveIntensity={2.5}
        toneMapped={false}
      />
    </mesh>
  );
};

/* ─────────────────────────────────────────
   Connection Lines
   ───────────────────────────────────────── */
const ConnectionLines = ({ nodes, maxDist }: { nodes: [number, number, number][]; maxDist: number }) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const livePos = useRef(new Float32Array(nodes.length * 3));

  const pairs = useMemo(() => {
    const p: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) p.push([i, j]);
    return p;
  }, [nodes.length]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(pairs.length * 6);
    const colors = new Float32Array(pairs.length * 6);
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [pairs.length]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = (geo.getAttribute("position") as THREE.BufferAttribute).array as Float32Array;
    const col = (geo.getAttribute("color") as THREE.BufferAttribute).array as Float32Array;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      livePos.current[i * 3] = n[0] + Math.sin(t * 0.3 + n[1]) * 0.12;
      livePos.current[i * 3 + 1] = n[1] + Math.cos(t * 0.4 + n[0]) * 0.1;
      livePos.current[i * 3 + 2] = n[2] + Math.sin(t * 0.2 + n[2]) * 0.08;
    }

    for (let p = 0; p < pairs.length; p++) {
      const [a, b] = pairs[p];
      const ax = livePos.current[a * 3], ay = livePos.current[a * 3 + 1], az = livePos.current[a * 3 + 2];
      const bx = livePos.current[b * 3], by = livePos.current[b * 3 + 1], bz = livePos.current[b * 3 + 2];
      const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
      const idx = p * 6;

      if (dist < maxDist) {
        const alpha = 1 - dist / maxDist;
        pos[idx] = ax; pos[idx + 1] = ay; pos[idx + 2] = az;
        pos[idx + 3] = bx; pos[idx + 4] = by; pos[idx + 5] = bz;
        col[idx] = 0; col[idx + 1] = alpha * 0.8; col[idx + 2] = alpha * 0.5;
        col[idx + 3] = 0; col[idx + 4] = alpha * 0.8; col[idx + 5] = alpha * 0.5;
      } else {
        for (let k = 0; k < 6; k++) { pos[idx + k] = 0; col[idx + k] = 0; }
      }
    }

    geo.getAttribute("position").needsUpdate = true;
    geo.getAttribute("color").needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} geometry={geo}>
      <lineBasicMaterial vertexColors transparent opacity={0.5} toneMapped={false} />
    </lineSegments>
  );
};

/* ─────────────────────────────────────────
   Node Label
   ───────────────────────────────────────── */
const NodeLabel = ({ position, text }: { position: [number, number, number]; text: string }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = position[0] + Math.sin(t * 0.3 + position[1]) * 0.12 + 0.07;
    ref.current.position.y = position[1] + Math.cos(t * 0.4 + position[0]) * 0.1 + 0.07;
    ref.current.position.z = position[2] + Math.sin(t * 0.2 + position[2]) * 0.08;
  });

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 48;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 48, 24);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text]);

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[0.22, 0.11]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
};

/* ─────────────────────────────────────────
   3D Object clusters (one per slide)
   ───────────────────────────────────────── */
const ObjectCluster1 = () => (
  <group position={[0, 0, 0]}>
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh position={[0, 0, -1]} castShadow>
        <boxGeometry args={[1.4, 1, 1.4]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.12} metalness={0.15} />
      </mesh>
    </Float>
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh position={[-1.2, 0.6, -0.5]} scale={0.6} castShadow>
        <boxGeometry args={[1, 0.7, 1]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.1} metalness={0.1} />
      </mesh>
    </Float>
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh position={[1.0, -0.4, 0.3]} scale={0.5} castShadow>
        <boxGeometry args={[1, 0.8, 0.9]} />
        <meshStandardMaterial color="#c8c8c8" roughness={0.15} metalness={0.2} />
      </mesh>
    </Float>
  </group>
);

const ObjectCluster2 = () => (
  <group position={[2, 0.5, -1]}>
    <Float speed={1.0} rotationIntensity={0.5} floatIntensity={0.7}>
      <mesh position={[0, 0, 0]} castShadow>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.08} metalness={0.3} />
      </mesh>
    </Float>
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh position={[-0.8, -0.8, 0.5]} scale={0.55} castShadow>
        <boxGeometry args={[1, 1, 0.6]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.12} metalness={0.15} />
      </mesh>
    </Float>
    <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh position={[1.0, 0.7, -0.3]} scale={0.4} castShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.1} metalness={0.25} />
      </mesh>
    </Float>
  </group>
);

const ObjectCluster3 = () => (
  <group position={[-1.5, -0.5, 0]}>
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.6}>
      <mesh position={[0, 0, 0]} castShadow>
        <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.06} metalness={0.35} />
      </mesh>
    </Float>
    <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh position={[1.2, 0.5, -0.5]} scale={0.5} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.1} metalness={0.2} />
      </mesh>
    </Float>
    <Float speed={1.7} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh position={[-0.6, 0.9, 0.4]} scale={0.45} castShadow>
        <boxGeometry args={[1, 0.6, 1.2]} />
        <meshStandardMaterial color="#cccccc" roughness={0.14} metalness={0.18} />
      </mesh>
    </Float>
  </group>
);

/* ─────────────────────────────────────────
   Camera Controller (scroll-driven)
   ───────────────────────────────────────── */
const CameraController = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    // Determine which two slides we're between
    const totalSlides = slides.length;
    const raw = progress * (totalSlides - 1);
    const idx = Math.min(Math.floor(raw), totalSlides - 2);
    const t = raw - idx;

    const from = slides[idx];
    const to = slides[idx + 1] || slides[idx];

    // Smooth cubic easing
    const ease = t * t * (3 - 2 * t);

    targetPos.current.set(
      THREE.MathUtils.lerp(from.cameraPos[0], to.cameraPos[0], ease),
      THREE.MathUtils.lerp(from.cameraPos[1], to.cameraPos[1], ease),
      THREE.MathUtils.lerp(from.cameraPos[2], to.cameraPos[2], ease)
    );

    targetLook.current.set(
      THREE.MathUtils.lerp(from.cameraLookAt[0], to.cameraLookAt[0], ease),
      THREE.MathUtils.lerp(from.cameraLookAt[1], to.cameraLookAt[1], ease),
      THREE.MathUtils.lerp(from.cameraLookAt[2], to.cameraLookAt[2], ease)
    );

    // Lerp camera for smoothness
    camera.position.lerp(targetPos.current, 0.08);
    currentLook.current.lerp(targetLook.current, 0.08);
    camera.lookAt(currentLook.current);
  });

  return null;
};

/* ─────────────────────────────────────────
   3D Scene
   ───────────────────────────────────────── */
const Scene3D = ({ progress }: { progress: number }) => {
  const nodes = useMemo<[number, number, number][]>(
    () => [
      [-2.0, 1.4, -0.8], [-0.5, 1.6, 0.2], [0.9, 1.2, -0.4], [2.0, 1.0, 0.6],
      [-1.6, 0.1, 0.3], [-0.2, 0.3, -0.5], [0.6, -0.2, 0.4], [1.7, 0.4, -0.2],
      [-1.3, -1.3, -0.4], [0.0, -1.1, 0.3], [1.1, -1.4, 0.0], [2.1, -0.7, 0.5],
      [-0.9, 0.8, 0.7], [0.3, 0.9, -0.6], [1.4, -0.6, 0.5], [-1.1, -0.6, 0.6],
      [0.8, 0.6, 0.2], [-1.8, -0.3, -0.6], [1.8, 1.4, -0.5], [0.0, -0.5, -0.7],
      // Cluster 2 area
      [2.5, 1.2, -1.5], [3.2, 0.3, -0.8], [1.5, 0.8, -1.3], [2.8, -0.4, -0.6],
      // Cluster 3 area
      [-2.2, -0.8, -0.3], [-1.0, -1.5, 0.5], [-1.8, 0.4, -1.0], [-0.5, -0.3, 0.8],
    ],
    []
  );

  const labels = ["78", "67", "85", "61", "57", "92", "43", "76", "88", "51", "64", "73", "69", "54", "82", "47", "71", "39", "95", "66", "83", "41", "58", "74", "87", "52", "63", "79"];

  return (
    <>
      <CameraController progress={progress} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={0.9} />
      <directionalLight position={[-3, -2, 4]} intensity={0.25} color="#00ffaa" />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#00ffaa" />
      <pointLight position={[2, 1, -1]} intensity={0.3} color="#00ddff" />
      <fog attach="fog" args={["#0a0d10", 4, 12]} />

      {/* Vertex network */}
      <ConnectionLines nodes={nodes} maxDist={1.8} />
      {nodes.map((pos, i) => (
        <VertexNode key={i} position={pos} />
      ))}
      {nodes.filter((_, i) => i % 3 === 0).map((pos, i) => (
        <NodeLabel key={`l-${i}`} position={pos} text={labels[i * 3] || ""} />
      ))}

      {/* 3D object clusters */}
      <ObjectCluster1 />
      <ObjectCluster2 />
      <ObjectCluster3 />
    </>
  );
};

/* ─────────────────────────────────────────
   Text Overlay per slide
   ───────────────────────────────────────── */
const SlideOverlay = ({ slide, index, progress }: { slide: StorySlide; index: number; progress: number }) => {
  const totalSlides = slides.length;
  const slideStart = index / totalSlides;
  const slideEnd = (index + 1) / totalSlides;
  const slideMid = (slideStart + slideEnd) / 2;

  // Compute opacity based on progress
  const fadeIn = slideStart;
  const fadeOut = slideEnd;
  const range = (slideEnd - slideStart) * 0.2;

  let opacity = 0;
  if (progress >= fadeIn && progress <= fadeOut) {
    if (progress < fadeIn + range) {
      opacity = (progress - fadeIn) / range;
    } else if (progress > fadeOut - range) {
      opacity = (fadeOut - progress) / range;
    } else {
      opacity = 1;
    }
  }
  opacity = Math.max(0, Math.min(1, opacity));

  const y = (1 - opacity) * 40;

  return (
    <div
      className="absolute inset-0 flex items-center z-20 pointer-events-none px-6 md:px-16"
      style={{ opacity, transform: `translateY(${y}px)`, transition: "none" }}
    >
      <div className={`max-w-lg ${index === 1 ? "ml-auto text-right" : ""}`}>
        <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary mb-4">
          {slide.label}
        </span>
        <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-tight mb-6 text-foreground">
          {slide.heading}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
          {slide.description}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main ScrollStory Component
   ───────────────────────────────────────── */
const ScrollStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(v);
  });

  return (
    <div ref={containerRef} className="relative" style={{ height: `${slides.length * 100}vh` }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D Canvas */}
        {mounted && (
          <div className="absolute inset-0 z-0">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <Scene3D progress={progress} />
            </Canvas>
          </div>
        )}

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background/50 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background/50 to-transparent" />
        </div>

        {/* Text overlays */}
        {slides.map((slide, i) => (
          <SlideOverlay key={i} slide={slide} index={i} progress={progress} />
        ))}

        {/* Scroll progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, i) => {
            const slideProgress = i / slides.length;
            const isActive = progress >= slideProgress && progress < (i + 1) / slides.length;
            return (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  isActive ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollStory;
