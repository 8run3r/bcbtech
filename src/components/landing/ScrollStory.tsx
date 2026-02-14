import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
    label: "01 — Surveillance",
    heading: "Vidíme, čo iní\nprehliadajú",
    description:
      "Profesionálne kamerové systémy s AI detekciou, nočným videním a 24/7 monitoringom. Hikvision, Dahua, Uniview.",
    cameraPos: [0, 0.3, 4],
    cameraLookAt: [0, 0, 0],
  },
  {
    label: "02 — Web & Software",
    heading: "Vytvárame digitálne\nprodukty",
    description:
      "Od landing pages po komplexné SaaS platformy. React, TypeScript, moderné technológie — vaša vízia, naša realizácia.",
    cameraPos: [4, 0.5, 3],
    cameraLookAt: [4, 0, 0],
  },
  {
    label: "03 — Infrastructure",
    heading: "Technológia\ns účelom",
    description:
      "Spoľahlivá infraštruktúra — servery, siete, NVR rekordéry. Všetko navrhnuté tak, aby to fungovalo non-stop.",
    cameraPos: [-4, 0, 4],
    cameraLookAt: [-4, 0, 0],
  },
];

/* ─────────────────────────────────────────
   3D Laptop (Web section)
   ───────────────────────────────────────── */
const Laptop = ({ progress, isMobile }: { progress: number; isMobile: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);

  // Compute lid angle based on scroll progress
  // Slide 2 (Web) starts at progress ~0.33, fully open by ~0.5
  const getLidAngle = (p: number) => {
    // Closed = lid folded down onto keyboard, Open = upright
    const openStart = 0.2;
    const openEnd = 0.45;
    if (p <= openStart) return Math.PI * 0.55; // fully closed (lid folded forward)
    if (p >= openEnd) return 0; // fully open (upright)
    const t = (p - openStart) / (openEnd - openStart);
    const eased = t * t * (3 - 2 * t);
    return Math.PI * 0.55 * (1 - eased);
  };

  // Screen content texture
  const screenTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d")!;
    
    // Dark background
    ctx.fillStyle = "#0a0d10";
    ctx.fillRect(0, 0, 512, 320);
    
    // Sidebar
    ctx.fillStyle = "#111419";
    ctx.fillRect(0, 0, 90, 320);
    
    // Sidebar dots
    const sideColors = ["#00ffaa", "#8b5cf6", "#3b82f6", "#6b7280", "#6b7280"];
    sideColors.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(45, 40 + i * 28, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Header bar
    ctx.fillStyle = "#151920";
    ctx.fillRect(90, 0, 422, 36);
    
    // Search bar
    ctx.fillStyle = "#1a1f28";
    ctx.strokeStyle = "#2a2f38";
    ctx.lineWidth = 1;
    const rx = 200, ry = 10, rw = 180, rh = 18;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 9);
    ctx.fill();
    ctx.stroke();
    
    // Stat cards
    const cardColors = ["#00ffaa", "#8b5cf6", "#3b82f6", "#f59e0b"];
    for (let i = 0; i < 4; i++) {
      const cx = 110 + i * 95;
      ctx.fillStyle = "#151920";
      ctx.beginPath();
      ctx.roundRect(cx, 50, 80, 45, 6);
      ctx.fill();
      ctx.fillStyle = cardColors[i];
      ctx.font = "bold 14px monospace";
      ctx.fillText(["60,791", "42,703", "2", "100,345"][i], cx + 8, 72);
      ctx.fillStyle = "#6b7280";
      ctx.font = "8px sans-serif";
      ctx.fillText(["Revenue", "Users", "New", "Views"][i], cx + 8, 86);
    }
    
    // Chart area
    ctx.fillStyle = "#151920";
    ctx.beginPath();
    ctx.roundRect(110, 110, 185, 100, 6);
    ctx.fill();
    
    // Chart line
    ctx.strokeStyle = "#00ffaa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const points = [
      [120, 190], [140, 175], [160, 180], [180, 155], [200, 160],
      [220, 140], [240, 145], [260, 125], [280, 130]
    ];
    points.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    
    // Right cards
    ctx.fillStyle = "#151920";
    ctx.beginPath();
    ctx.roundRect(310, 110, 85, 100, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(405, 110, 85, 100, 6);
    ctx.fill();

    // Donut chart
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(352, 160, 22, -0.5, Math.PI * 1.3);
    ctx.stroke();
    ctx.strokeStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(352, 160, 22, Math.PI * 1.3, Math.PI * 2 - 0.5);
    ctx.stroke();

    // Pie chart
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(447, 160);
    ctx.arc(447, 160, 22, 0, Math.PI * 1.2);
    ctx.fill();
    ctx.fillStyle = "#06b6d4";
    ctx.beginPath();
    ctx.moveTo(447, 160);
    ctx.arc(447, 160, 22, Math.PI * 1.2, Math.PI * 2);
    ctx.fill();
    
    // Bottom section
    ctx.fillStyle = "#151920";
    ctx.beginPath();
    ctx.roundRect(110, 225, 380, 80, 6);
    ctx.fill();
    
    // Table rows
    for (let r = 0; r < 3; r++) {
      ctx.fillStyle = "#2a2f38";
      ctx.fillRect(120, 248 + r * 18, 360, 1);
      ctx.fillStyle = "#6b7280";
      ctx.font = "7px sans-serif";
      ctx.fillText(["Dashboard   |   60,791   |   +1.2%   |   Active", "Users        |   42,703   |   +0.8%   |   Active", "Analytics   |   100,345  |   -0.5%   |   Pending"][r], 125, 244 + r * 18);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
    
    // Animate lid
    if (lidRef.current) {
      const targetAngle = getLidAngle(progress);
      lidRef.current.rotation.x = THREE.MathUtils.lerp(
        lidRef.current.rotation.x,
        targetAngle,
        0.08
      );
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={groupRef} position={isMobile ? [2, 0.5, 0] : [4, 0, 0]} scale={isMobile ? 0.55 : 1}>
        {/* Base / Keyboard area */}
        <RoundedBox args={[3.4, 0.08, 2.0]} radius={0.04} position={[0, -0.45, 0.9]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
        </RoundedBox>
        
        {/* Keyboard keys */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <mesh
              key={`k-${row}-${col}`}
              position={[
                -1.35 + col * 0.23,
                -0.40,
                0.2 + row * 0.22,
              ]}
            >
              <boxGeometry args={[0.18, 0.02, 0.16]} />
              <meshStandardMaterial color="#252525" roughness={0.6} metalness={0.4} />
            </mesh>
          ))
        )}
        
        {/* Trackpad */}
        <mesh position={[0, -0.40, 1.4]}>
          <boxGeometry args={[0.9, 0.01, 0.5]} />
          <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Lid (screen) — pivots at the hinge (back edge of base) */}
        <group ref={lidRef} position={[0, -0.45, -0.1]} rotation={[Math.PI * 0.55, 0, 0]}>
          {/* Screen frame — origin at bottom edge so it rotates like a real lid */}
          <group position={[0, 1.0, 0]}>
            <RoundedBox args={[3.2, 2.0, 0.08]} radius={0.06}>
              <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
            </RoundedBox>
            {/* Screen display */}
            <mesh position={[0, 0, 0.045]}>
              <planeGeometry args={[2.9, 1.8]} />
              <meshBasicMaterial map={screenTex} toneMapped={false} />
            </mesh>
            {/* Screen glow */}
            <pointLight position={[0, 0, 1]} intensity={0.3} color="#00ffaa" distance={3} />
          </group>
        </group>
      </group>
    </Float>
  );
};

/* ─────────────────────────────────────────
   3D Security Camera — Ceiling-mounted Bullet (Hikvision-style)
   ───────────────────────────────────────── */
const SecurityCamera = () => {
  const cameraRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.Mesh>(null);
  const lensRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    const t = clock.getElapsedTime();
    // Start facing us (angle=0), then slowly start panning after 2s
    const rampUp = Math.min(t / 4, 1); // 0→1 over 4 seconds
    cameraRef.current.rotation.y = rampUp * Math.sin(t * 0.12) * 0.6;

    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = Math.sin(t * 3) > 0.3 ? 4 : 0.5;
    }
    if (lensRef.current) {
      const mat = lensRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.15;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.3}>
      {/* Centered around origin so slide 1 camera sees it properly */}
      <group position={[0, 0, 0]} scale={1.0}>

        {/* ── Ceiling mount plate ── */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.35} />
        </mesh>
        <mesh position={[0, 1.8, 0]}>
          <torusGeometry args={[0.4, 0.01, 8, 32]} />
          <meshStandardMaterial color="#d0d0d0" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* ── Vertical drop arm ── */}
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 0.65, 16]} />
          <meshStandardMaterial color="#e2e2e2" roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <torusGeometry args={[0.09, 0.01, 8, 20]} />
          <meshStandardMaterial color="#ccc" roughness={0.3} metalness={0.45} />
        </mesh>

        {/* ── Ball joint ── */}
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color="#d8d8d8" roughness={0.3} metalness={0.35} />
        </mesh>

        {/* ── Camera body — angled down-forward ── */}
        <group ref={cameraRef} position={[0, 1.05, 0]}>
          <group rotation={[0.25, 0, -0.5]}>
            {/* Connector */}
            <mesh position={[0.18, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.09, 0.18, 12]} />
              <meshStandardMaterial color="#ddd" roughness={0.35} metalness={0.3} />
            </mesh>

            {/* Bullet body */}
            <group position={[0.6, -0.12, 0]}>
              {/* Back cap — closed rounded end */}
              <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.001, 0.27, 0.25, 24]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.3} metalness={0.25} />
              </mesh>

              {/* Main cylinder */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.27, 1.2, 24]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.3} metalness={0.25} />
              </mesh>

              {/* Accent rings */}
              {[-0.35, -0.05, 0.2].map((x, i) => (
                <mesh key={`ring${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.26, 0.005, 8, 24]} />
                  <meshStandardMaterial color="#d5d5d5" roughness={0.3} metalness={0.4} />
                </mesh>
              ))}

              {/* Sunshield */}
              <mesh position={[0.45, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.30, 0.32, 0.3, 24, 1, true, -Math.PI * 0.15, Math.PI * 1.3]} />
                <meshStandardMaterial color="#eaeaea" roughness={0.35} metalness={0.3} side={THREE.DoubleSide} />
              </mesh>

              {/* Lens housing */}
              <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.21, 0.25, 0.16, 24]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.15} metalness={0.85} />
              </mesh>
              <mesh position={[0.71, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.16, 0.20, 0.05, 24]} />
                <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} />
              </mesh>

              {/* Lens glass */}
              <mesh ref={lensRef} position={[0.74, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.12, 0.14, 0.03, 24]} />
                <meshStandardMaterial
                  color="#001a11"
                  emissive="#003322"
                  emissiveIntensity={0.3}
                  roughness={0.02}
                  metalness={0.15}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              {/* Inner lens */}
              <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
                <meshStandardMaterial color="#050505" roughness={0.05} metalness={0.95} />
              </mesh>
              <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
                <meshStandardMaterial color="#000" roughness={0.02} metalness={1} />
              </mesh>

              {/* IR LEDs */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const r = 0.17;
                return (
                  <mesh key={`ir${i}`} position={[0.71, Math.sin(angle) * r, Math.cos(angle) * r]}>
                    <sphereGeometry args={[0.009, 6, 6]} />
                    <meshStandardMaterial color="#1a0000" roughness={0.2} metalness={0.6} />
                  </mesh>
                );
              })}

              {/* Green LED */}
              <mesh ref={ledRef} position={[0.05, 0.26, 0]}>
                <sphereGeometry args={[0.016, 10, 10]} />
                <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={4} toneMapped={false} />
              </mesh>
              <pointLight position={[0.05, 0.26, 0]} intensity={0.2} color="#00ff55" distance={1.5} />

              {/* Cable */}
              <mesh position={[-0.5, -0.2, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Lighting */}
        <pointLight position={[1.5, 0.5, 1]} intensity={0.5} color="#00ffaa" distance={5} />
        <pointLight position={[-0.5, -0.5, 1.5]} intensity={0.2} color="#ffffff" distance={4} />
      </group>
    </Float>
  );
};

/* ─────────────────────────────────────────
   3D Server Rack (Infrastructure section)
   ───────────────────────────────────────── */
const ServerRack = ({ isMobile }: { isMobile: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ledRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.25) * 0.2;
    
    // Blinking LEDs
    const t = clock.getElapsedTime();
    ledRefs.current.forEach((led, i) => {
      if (!led) return;
      const mat = led.material as THREE.MeshStandardMaterial;
      const blink = Math.sin(t * (2 + i * 0.7) + i * 1.5) > 0 ? 3 : 0.5;
      mat.emissiveIntensity = blink;
    });
  });

  const setLedRef = (el: THREE.Mesh | null, i: number) => {
    if (el) ledRefs.current[i] = el;
  };

  return (
    <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.3}>
      <group ref={groupRef} position={isMobile ? [-2, 0, 0] : [-4, 0, 0]} scale={isMobile ? 0.6 : 1}>
        {/* Rack frame */}
        <RoundedBox args={[1.8, 3.2, 1.0]} radius={0.04} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.85} />
        </RoundedBox>
        
        {/* Server units (5 units stacked) */}
        {Array.from({ length: 5 }).map((_, i) => (
          <group key={i} position={[0, 1.15 - i * 0.55, 0.05]}>
            {/* Server body */}
            <RoundedBox args={[1.6, 0.4, 0.9]} radius={0.02}>
              <meshStandardMaterial
                color={i === 1 ? "#222" : "#181818"}
                roughness={0.4}
                metalness={0.7}
              />
            </RoundedBox>
            
            {/* Front panel line */}
            <mesh position={[0, 0, 0.46]}>
              <planeGeometry args={[1.5, 0.35]} />
              <meshStandardMaterial color="#151515" roughness={0.5} metalness={0.6} />
            </mesh>
            
            {/* Vent holes */}
            {Array.from({ length: 8 }).map((_, v) => (
              <mesh key={v} position={[0.3 + v * 0.1, 0, 0.47]}>
                <planeGeometry args={[0.04, 0.25]} />
                <meshStandardMaterial color="#0d0d0d" roughness={0.8} />
              </mesh>
            ))}
            
            {/* Status LEDs */}
            <mesh
              ref={(el) => setLedRef(el, i * 2)}
              position={[-0.65, 0.05, 0.47]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color="#00ffaa"
                emissive="#00ffaa"
                emissiveIntensity={2}
                toneMapped={false}
              />
            </mesh>
            <mesh
              ref={(el) => setLedRef(el, i * 2 + 1)}
              position={[-0.65, -0.05, 0.47]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color={i === 3 ? "#f59e0b" : "#00ffaa"}
                emissive={i === 3 ? "#f59e0b" : "#00ffaa"}
                emissiveIntensity={1}
                toneMapped={false}
              />
            </mesh>
            
            {/* Drive bay handle */}
            <mesh position={[-0.55, 0, 0.47]}>
              <boxGeometry args={[0.06, 0.2, 0.01]} />
              <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))}
        
        {/* Ambient glow */}
        <pointLight position={[0, 0, 1.5]} intensity={0.4} color="#00ffaa" distance={4} />
      </group>
    </Float>
  );
};

/* ─────────────────────────────────────────
   Camera Controller (scroll-driven)
   ───────────────────────────────────────── */
const CameraController = ({ progress, isMobile }: { progress: number; isMobile: boolean }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  // Mobile-adjusted slide camera positions
  const getSlidePositions = (slide: StorySlide, idx: number) => {
    if (!isMobile) return { pos: slide.cameraPos, look: slide.cameraLookAt };
    // On mobile, bring cameras closer and more centered
    const mobilePositions: [number, number, number][] = [
      [0, 0.3, 5],    // Camera slide - slightly further
      [2, 0.5, 5],    // Laptop - more centered, further back
      [-2, 0, 5],     // Server - more centered, further back
    ];
    const mobileLookAts: [number, number, number][] = [
      [0, 0, 0],
      [2, 0, 0],
      [-2, 0, 0],
    ];
    return { pos: mobilePositions[idx] || slide.cameraPos, look: mobileLookAts[idx] || slide.cameraLookAt };
  };

  useFrame(() => {
    const totalSlides = slides.length;
    const raw = progress * (totalSlides - 1);
    const idx = Math.min(Math.floor(raw), totalSlides - 2);
    const t = raw - idx;

    const fromData = getSlidePositions(slides[idx], idx);
    const toData = getSlidePositions(slides[idx + 1] || slides[idx], idx + 1);

    const ease = t * t * (3 - 2 * t);

    targetPos.current.set(
      THREE.MathUtils.lerp(fromData.pos[0], toData.pos[0], ease),
      THREE.MathUtils.lerp(fromData.pos[1], toData.pos[1], ease),
      THREE.MathUtils.lerp(fromData.pos[2], toData.pos[2], ease)
    );

    targetLook.current.set(
      THREE.MathUtils.lerp(fromData.look[0], toData.look[0], ease),
      THREE.MathUtils.lerp(fromData.look[1], toData.look[1], ease),
      THREE.MathUtils.lerp(fromData.look[2], toData.look[2], ease)
    );

    camera.position.lerp(targetPos.current, 0.06);
    currentLook.current.lerp(targetLook.current, 0.06);
    camera.lookAt(currentLook.current);
  });

  return null;
};

/* ─────────────────────────────────────────
   Floating particles (minimal)
   ───────────────────────────────────────── */
const FloatingParticles = () => {
  const ref = useRef<THREE.Points>(null);

  const { positions } = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return { positions: pos };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00ffaa"
        size={0.03}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

/* ─────────────────────────────────────────
   3D Scene
   ───────────────────────────────────────── */
const Scene3D = ({ progress }: { progress: number }) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      <CameraController progress={progress} isMobile={isMobile} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <directionalLight position={[-3, -2, 4]} intensity={0.2} color="#00ffaa" />
      <fog attach="fog" args={["#0a0d10", 6, 16]} />

      <FloatingParticles />

      {/* Contextual 3D objects */}
      <SecurityCamera />
      <Laptop progress={progress} isMobile={isMobile} />
      <ServerRack isMobile={isMobile} />
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
  const range = (slideEnd - slideStart) * 0.2;

  let opacity = 0;
  if (progress >= slideStart && progress <= slideEnd) {
    if (progress < slideStart + range) {
      opacity = (progress - slideStart) / range;
    } else if (progress > slideEnd - range) {
      opacity = (slideEnd - progress) / range;
    } else {
      opacity = 1;
    }
  }
  opacity = Math.max(0, Math.min(1, opacity));
  const y = (1 - opacity) * 50;

  // Alternate sides: 0=left, 1=right, 2=left
  const isRight = index === 1;

  return (
    <div
      className="absolute inset-0 flex items-end sm:items-center z-20 pointer-events-none px-5 sm:px-8 md:px-20 pb-24 sm:pb-0"
      style={{ opacity, transform: `translateY(${y}px)` }}
    >
      <div className={`max-w-xs sm:max-w-md ${isRight ? "sm:ml-auto sm:text-right" : ""}`}>
        <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-primary/80 mb-3 sm:mb-5 font-mono">
          {slide.label}
        </span>
        <h2 className="text-2xl sm:text-[clamp(2rem,5vw,3.8rem)] font-bold leading-[1.1] tracking-tight mb-3 sm:mb-6 text-foreground whitespace-pre-line">
          {slide.heading}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs sm:max-w-sm">
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
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {mounted && (
          <div className="absolute inset-0 z-0">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
              className="!touch-auto"
            >
              <Scene3D progress={progress} />
            </Canvas>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Text overlays */}
        {slides.map((slide, i) => (
          <SlideOverlay key={i} slide={slide} index={i} progress={progress} />
        ))}

        {/* Progress dots */}
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3">
          {slides.map((_, i) => {
            const slideProgress = i / slides.length;
            const isActive = progress >= slideProgress && progress < (i + 1) / slides.length;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`rounded-full transition-all duration-500 ${
                    isActive ? "w-6 sm:w-8 h-1 sm:h-1.5 bg-primary" : "w-1.5 sm:w-2 h-1 sm:h-1.5 bg-muted-foreground/20"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollStory;
