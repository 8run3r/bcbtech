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

  const getLidAngle = (p: number) => {
    const openStart = 0.2;
    const openEnd = 0.45;
    if (p <= openStart) return Math.PI * 0.55;
    if (p >= openEnd) return 0;
    const t = (p - openStart) / (openEnd - openStart);
    const eased = t * t * (3 - 2 * t);
    return Math.PI * 0.55 * (1 - eased);
  };

  const screenTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d")!;
    
    ctx.fillStyle = "#0c1017";
    ctx.fillRect(0, 0, 512, 320);
    
    // Sidebar
    ctx.fillStyle = "#0f1318";
    ctx.fillRect(0, 0, 80, 320);
    const sideColors = ["#00ffaa", "#8b5cf6", "#3b82f6", "#475569", "#475569", "#475569"];
    sideColors.forEach((c, i) => {
      if (i === 0) {
        ctx.fillStyle = "#151c25";
        ctx.beginPath();
        ctx.roundRect(6, 28 + i * 30, 68, 24, 4);
        ctx.fill();
      }
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(22, 40 + i * 30, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = i === 0 ? "#e2e8f0" : "#64748b";
      ctx.font = "7px sans-serif";
      ctx.fillText(["Home", "Users", "Stats", "Files", "Mail", "Conf"][i], 32, 42 + i * 30);
    });
    
    // Top bar
    ctx.fillStyle = "#111820";
    ctx.fillRect(80, 0, 432, 32);
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(180, 7, 200, 18, 9);
    ctx.fill();
    ctx.fillStyle = "#475569";
    ctx.font = "8px sans-serif";
    ctx.fillText("⌕  Search...", 195, 19);
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(470, 16, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("A", 467, 19);
    
    // Stat cards
    const cardData = [
      { value: "€60,791", label: "Revenue", color: "#00ffaa", change: "+12.5%" },
      { value: "42,703", label: "Users", color: "#8b5cf6", change: "+8.2%" },
      { value: "2,847", label: "Orders", color: "#3b82f6", change: "+3.1%" },
      { value: "98.2%", label: "Uptime", color: "#f59e0b", change: "+0.1%" },
    ];
    for (let i = 0; i < 4; i++) {
      const cx = 95 + i * 100;
      ctx.fillStyle = "#111820";
      ctx.beginPath();
      ctx.roundRect(cx, 42, 90, 52, 6);
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 12px monospace";
      ctx.fillText(cardData[i].value, cx + 8, 62);
      ctx.fillStyle = "#64748b";
      ctx.font = "7px sans-serif";
      ctx.fillText(cardData[i].label, cx + 8, 74);
      ctx.fillStyle = cardData[i].color + "22";
      ctx.beginPath();
      ctx.roundRect(cx + 8, 78, 30, 10, 3);
      ctx.fill();
      ctx.fillStyle = cardData[i].color;
      ctx.font = "bold 6px monospace";
      ctx.fillText(cardData[i].change, cx + 12, 86);
    }
    
    // Main chart
    ctx.fillStyle = "#111820";
    ctx.beginPath();
    ctx.roundRect(95, 105, 200, 110, 6);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("Revenue Overview", 105, 120);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.3;
    for (let g = 0; g < 4; g++) {
      ctx.beginPath();
      ctx.moveTo(105, 135 + g * 18);
      ctx.lineTo(280, 135 + g * 18);
      ctx.stroke();
    }
    const chartPoints = [
      [110, 185], [130, 172], [150, 176], [170, 155], [190, 160],
      [210, 142], [230, 148], [250, 132], [270, 138]
    ];
    ctx.beginPath();
    chartPoints.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.lineTo(270, 195);
    ctx.lineTo(110, 195);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 130, 0, 195);
    grad.addColorStop(0, "rgba(0,255,170,0.2)");
    grad.addColorStop(1, "rgba(0,255,170,0.01)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#00ffaa";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    chartPoints.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    chartPoints.forEach(([px, py]) => {
      ctx.fillStyle = "#00ffaa";
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Donut chart card
    ctx.fillStyle = "#111820";
    ctx.beginPath();
    ctx.roundRect(305, 105, 90, 110, 6);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 7px sans-serif";
    ctx.fillText("Traffic", 315, 120);
    const donutData = [
      { angle: 1.8, color: "#8b5cf6" },
      { angle: 1.2, color: "#3b82f6" },
      { angle: 0.8, color: "#f43f5e" },
      { angle: 0.5, color: "#f59e0b" },
    ];
    let startAngle = -Math.PI / 2;
    donutData.forEach(({ angle, color }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(350, 158, 20, startAngle, startAngle + angle);
      ctx.stroke();
      startAngle += angle;
    });
    ctx.fillStyle = "#111820";
    ctx.beginPath();
    ctx.arc(350, 158, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 7px monospace";
    ctx.fillText("73%", 341, 161);
    ["Direct", "Social", "Email", "Other"].forEach((label, i) => {
      ctx.fillStyle = ["#8b5cf6", "#3b82f6", "#f43f5e", "#f59e0b"][i];
      ctx.beginPath();
      ctx.arc(315, 192 + i * 6, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "5px sans-serif";
      ctx.fillText(label, 321, 194 + i * 6);
    });
    
    // Bar chart card
    ctx.fillStyle = "#111820";
    ctx.beginPath();
    ctx.roundRect(400, 105, 95, 110, 6);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 7px sans-serif";
    ctx.fillText("Activity", 410, 120);
    const barHeights = [28, 42, 35, 50, 38, 55, 45];
    barHeights.forEach((h, i) => {
      const barGrad = ctx.createLinearGradient(0, 200 - h, 0, 200);
      barGrad.addColorStop(0, "#3b82f6");
      barGrad.addColorStop(1, "#1e40af");
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(412 + i * 11, 200 - h, 8, h, 2);
      ctx.fill();
    });
    
    // Bottom table
    ctx.fillStyle = "#111820";
    ctx.beginPath();
    ctx.roundRect(95, 225, 400, 85, 6);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 7px sans-serif";
    ctx.fillText("Recent Transactions", 105, 240);
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 6px sans-serif";
    ["ID", "Customer", "Amount", "Status", "Date"].forEach((h, i) => {
      ctx.fillText(h, 105 + i * 80, 254);
    });
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(105, 257, 380, 0.5);
    const rows = [
      ["#4231", "John Doe", "€1,250", "Completed", "Today"],
      ["#4230", "Jane Smith", "€890", "Pending", "Today"],
      ["#4229", "Bob Wilson", "€2,100", "Completed", "Yesterday"],
    ];
    rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (c === 3) {
          const isCompleted = cell === "Completed";
          ctx.fillStyle = isCompleted ? "#00ffaa22" : "#f59e0b22";
          ctx.beginPath();
          ctx.roundRect(105 + c * 80 - 2, 262 + r * 14, 36, 9, 3);
          ctx.fill();
          ctx.fillStyle = isCompleted ? "#00ffaa" : "#f59e0b";
        } else {
          ctx.fillStyle = c === 0 ? "#94a3b8" : "#cbd5e1";
        }
        ctx.font = "6px sans-serif";
        ctx.fillText(cell, 105 + c * 80, 269 + r * 14);
      });
      if (r < 2) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(105, 273 + r * 14, 380, 0.3);
      }
    });
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
    if (lidRef.current) {
      const targetAngle = getLidAngle(progress);
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetAngle, 0.08);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={groupRef} position={isMobile ? [2, 0.5, 0] : [4, 0, 0]} scale={isMobile ? 0.55 : 1}>
        {/* Base — tapered like a real MacBook */}
        <RoundedBox args={[3.4, 0.06, 2.0]} radius={0.03} position={[0, -0.45, 0.9]}>
          <meshStandardMaterial color="#2d2d30" roughness={0.25} metalness={0.85} />
        </RoundedBox>
        <RoundedBox args={[3.38, 0.02, 1.98]} radius={0.03} position={[0, -0.49, 0.9]}>
          <meshStandardMaterial color="#1c1c1e" roughness={0.35} metalness={0.8} />
        </RoundedBox>
        {/* Rubber feet */}
        {([[-1.4, -0.50, 0.1], [1.4, -0.50, 0.1], [-1.4, -0.50, 1.7], [1.4, -0.50, 1.7]] as [number,number,number][]).map((pos, i) => (
          <mesh key={`foot-${i}`} position={pos}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 12]} />
            <meshStandardMaterial color="#111" roughness={0.9} metalness={0.1} />
          </mesh>
        ))}
        
        {/* Keyboard keys */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 13 }).map((_, col) => (
            <mesh key={`k-${row}-${col}`} position={[-1.38 + col * 0.22, -0.415, 0.15 + row * 0.21]}>
              <boxGeometry args={[0.17, 0.015, 0.15]} />
              <meshStandardMaterial color="#1a1a1c" roughness={0.5} metalness={0.3} />
            </mesh>
          ))
        )}
        
        {/* Trackpad — glass-like */}
        <mesh position={[0, -0.42, 1.4]}>
          <boxGeometry args={[0.95, 0.005, 0.55]} />
          <meshStandardMaterial color="#2a2a2c" roughness={0.1} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.42, 1.4]}>
          <boxGeometry args={[0.97, 0.003, 0.57]} />
          <meshStandardMaterial color="#222224" roughness={0.2} metalness={0.7} />
        </mesh>

        {/* Speaker grille */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={`sp-${i}`} position={[-1.5, -0.415, 0.3 + i * 0.07]}>
            <cylinderGeometry args={[0.008, 0.008, 0.02, 6]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={`sp2-${i}`} position={[1.5, -0.415, 0.3 + i * 0.07]}>
            <cylinderGeometry args={[0.008, 0.008, 0.02, 6]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        ))}

        {/* Hinge barrel */}
        <mesh position={[0, -0.44, -0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 3.2, 16]} />
          <meshStandardMaterial color="#222" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Lid (screen) */}
        <group ref={lidRef} position={[0, -0.45, -0.1]} rotation={[Math.PI * 0.55, 0, 0]}>
          <group position={[0, 1.0, 0]}>
            <RoundedBox args={[3.3, 2.1, 0.05]} radius={0.04}>
              <meshStandardMaterial color="#2d2d30" roughness={0.2} metalness={0.85} />
            </RoundedBox>
            <mesh position={[0, 0, 0.026]}>
              <planeGeometry args={[3.1, 1.95]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.02, 0.028]}>
              <planeGeometry args={[3.0, 1.85]} />
              <meshBasicMaterial map={screenTex} toneMapped={false} />
            </mesh>
            {/* Webcam */}
            <mesh position={[0, 0.97, 0.026]}>
              <circleGeometry args={[0.015, 16]} />
              <meshStandardMaterial color="#111" roughness={0.1} metalness={0.8} />
            </mesh>
            <mesh position={[0.03, 0.97, 0.027]}>
              <circleGeometry args={[0.005, 8]} />
              <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={2} toneMapped={false} />
            </mesh>
            {/* Back logo */}
            <mesh position={[0, 0, -0.027]}>
              <circleGeometry args={[0.12, 24]} />
              <meshStandardMaterial color="#3a3a3c" roughness={0.15} metalness={0.9} />
            </mesh>
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
    const rampUp = Math.min(t / 4, 1);
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
      <group position={[0, 0, 0]} scale={1.0}>
        {/* Ceiling mount plate — brushed metal */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 48]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Mounting screws */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={`screw-${i}`} position={[Math.cos(angle) * 0.32, 1.79, Math.sin(angle) * 0.32]}>
            <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
            <meshStandardMaterial color="#999" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 1.78, 0]}>
          <torusGeometry args={[0.42, 0.008, 8, 48]} />
          <meshStandardMaterial color="#bbb" roughness={0.25} metalness={0.65} />
        </mesh>

        {/* Vertical drop arm */}
        <mesh position={[0, 1.48, 0]}>
          <cylinderGeometry args={[0.065, 0.09, 0.6, 24]} />
          <meshStandardMaterial color="#d8d8d8" roughness={0.28} metalness={0.45} />
        </mesh>
        {[1.62, 1.35].map((y, i) => (
          <mesh key={`armring-${i}`} position={[0, y, 0]}>
            <torusGeometry args={[0.075, 0.008, 8, 24]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.25} metalness={0.55} />
          </mesh>
        ))}

        {/* Ball joint */}
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.17, 32, 32]} />
          <meshStandardMaterial color="#ccc" roughness={0.22} metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.006, 8, 32]} />
          <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.6} />
        </mesh>

        {/* Camera body */}
        <group ref={cameraRef} position={[0, 1.05, 0]}>
          <group rotation={[0.3, -1.25, -0.5]}>
            {/* Connector bracket */}
            <mesh position={[0.18, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.065, 0.085, 0.2, 16]} />
              <meshStandardMaterial color="#d0d0d0" roughness={0.28} metalness={0.45} />
            </mesh>

            {/* Bullet body */}
            <group position={[0.6, -0.12, 0]}>
              {/* Back cap — hemisphere */}
              <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <sphereGeometry args={[0.26, 32, 32, 0, Math.PI]} />
                <meshStandardMaterial color="#e8e8e8" roughness={0.22} metalness={0.35} />
              </mesh>
              {/* Main cylinder */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.26, 1.2, 32]} />
                <meshStandardMaterial color="#e8e8e8" roughness={0.22} metalness={0.35} />
              </mesh>
              {/* Accent rings */}
              {[-0.4, -0.15, 0.1, 0.25].map((x, i) => (
                <mesh key={`ring${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.255, 0.004, 8, 32]} />
                  <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.55} />
                </mesh>
              ))}
              {/* Ventilation slots */}
              {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={`vent-${i}`} position={[-0.2 + i * 0.08, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <boxGeometry args={[0.03, 0.003, 0.04]} />
                  <meshStandardMaterial color="#bbb" roughness={0.3} metalness={0.5} />
                </mesh>
              ))}
              {/* Sunshield */}
              <mesh position={[0.45, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.30, 0.32, 0.3, 32, 1, true, -Math.PI * 0.15, Math.PI * 1.3]} />
                <meshStandardMaterial color="#dedede" roughness={0.28} metalness={0.35} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.58, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.30, 0.006, 8, 32, Math.PI * 1.3]} />
                <meshStandardMaterial color="#ccc" roughness={0.2} metalness={0.5} />
              </mesh>
              {/* Lens housing */}
              <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.21, 0.25, 0.16, 32]} />
                <meshStandardMaterial color="#151515" roughness={0.1} metalness={0.9} />
              </mesh>
              <mesh position={[0.71, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.16, 0.20, 0.05, 32]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.08} metalness={0.95} />
              </mesh>
              {/* Lens glass */}
              <mesh ref={lensRef} position={[0.74, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.13, 0.15, 0.03, 32]} />
                <meshStandardMaterial color="#001a11" emissive="#003322" emissiveIntensity={0.3} roughness={0.01} metalness={0.2} transparent opacity={0.75} />
              </mesh>
              <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.04, 20]} />
                <meshStandardMaterial color="#030303" roughness={0.03} metalness={0.95} />
              </mesh>
              <mesh position={[0.755, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.015, 16]} />
                <meshStandardMaterial color="#000" roughness={0.01} metalness={1} />
              </mesh>
              {/* Lens reflection */}
              <mesh position={[0.76, 0.03, 0.02]} rotation={[0, 0, Math.PI / 2]}>
                <circleGeometry args={[0.015, 12]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
              </mesh>
              {/* IR LEDs */}
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                const r = 0.175;
                return (
                  <mesh key={`ir${i}`} position={[0.71, Math.sin(angle) * r, Math.cos(angle) * r]}>
                    <sphereGeometry args={[0.008, 8, 8]} />
                    <meshStandardMaterial color="#1a0000" emissive="#330000" emissiveIntensity={0.3} roughness={0.15} metalness={0.7} />
                  </mesh>
                );
              })}
              {/* Green LED */}
              <mesh ref={ledRef} position={[0.05, 0.26, 0]}>
                <sphereGeometry args={[0.014, 12, 12]} />
                <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={4} toneMapped={false} />
              </mesh>
              <pointLight position={[0.05, 0.26, 0]} intensity={0.15} color="#00ff55" distance={1.2} />
              {/* Label plate */}
              <mesh position={[-0.15, -0.25, 0.01]}>
                <planeGeometry args={[0.3, 0.04]} />
                <meshStandardMaterial color="#d5d5d5" roughness={0.3} metalness={0.4} />
              </mesh>
              {/* Cable with strain relief */}
              <mesh position={[-0.52, -0.18, 0]} rotation={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.025, 0.018, 0.25, 12]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
              </mesh>
              <mesh position={[-0.45, -0.1, 0]} rotation={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.03, 0.025, 0.06, 12]} />
                <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
              </mesh>
            </group>
          </group>
        </group>

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

  // Cable paths — bundles of ethernet/power cables inside the rack
  const cables = useMemo(() => {
    const cableData: { points: [number, number, number][]; color: string }[] = [];
    const cableColors = ["#1a6bff", "#ffaa00", "#00ccaa", "#ff4466", "#8844ff", "#44cc44", "#cc8800", "#4488ff"];
    // Vertical cable bundles on the back-left
    for (let c = 0; c < 8; c++) {
      const xBase = -0.55 + (c % 4) * 0.06;
      const zBase = -0.25 + Math.floor(c / 4) * 0.12;
      const pts: [number, number, number][] = [];
      // Goes from top connector down to bottom, with slight S-curves
      for (let s = 0; s <= 10; s++) {
        const t = s / 10;
        const y = 1.4 - t * 2.8;
        const xWobble = Math.sin(t * Math.PI * 2 + c * 0.8) * 0.03;
        const zWobble = Math.cos(t * Math.PI * 1.5 + c * 1.2) * 0.02;
        pts.push([xBase + xWobble, y, zBase + zWobble]);
      }
      cableData.push({ points: pts, color: cableColors[c] });
    }
    // Horizontal patch cables connecting servers to vertical bundle
    for (let s = 0; s < 6; s++) {
      const y = 1.3 - s * 0.48;
      for (let p = 0; p < 2; p++) {
        const pts: [number, number, number][] = [];
        const startX = 0.5 + p * 0.12;
        const endX = -0.45 + p * 0.04;
        const midDrop = -0.04 + Math.random() * 0.08;
        pts.push([startX, y - 0.05, -0.1]);
        pts.push([startX * 0.5 + endX * 0.5, y + midDrop, -0.2]);
        pts.push([endX, y, -0.25]);
        cableData.push({ points: pts, color: cableColors[(s * 2 + p) % 8] });
      }
    }
    return cableData;
  }, []);

  return (
    <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.3}>
      <group ref={groupRef} position={isMobile ? [-2, 0, 0] : [-4, 0, 0]} scale={isMobile ? 0.6 : 1}>

        {/* ── Metal frame (4 vertical posts + top/bottom rails) ── */}
        {/* Vertical corner posts */}
        {[[-0.9, -0.4], [-0.9, 0.4], [0.9, -0.4], [0.9, 0.4]].map(([x, z], i) => (
          <mesh key={`post-${i}`} position={[x, 0, z]}>
            <boxGeometry args={[0.06, 3.4, 0.06]} />
            <meshStandardMaterial color="#222" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}
        {/* Top frame rails */}
        {[[-0.4, 0.4], [-0.4, -0.4], [0.4, 0.4], [0.4, -0.4]].map(([z1], i) => (
          <mesh key={`toprail-${i}`} position={[0, 1.7, i < 2 ? -0.4 : 0.4]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.04, 1.8, 0.04]} />
            <meshStandardMaterial color="#252525" roughness={0.2} metalness={0.85} />
          </mesh>
        ))}
        {/* Bottom frame rails */}
        {[0.4, -0.4].map((z, i) => (
          <mesh key={`botrail-${i}`} position={[0, -1.7, z]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.04, 1.8, 0.04]} />
            <meshStandardMaterial color="#252525" roughness={0.2} metalness={0.85} />
          </mesh>
        ))}
        {/* Side connecting rails */}
        {[[-0.9, 1.7], [-0.9, -1.7], [0.9, 1.7], [0.9, -1.7]].map(([x, y], i) => (
          <mesh key={`siderail-${i}`} position={[x, y, 0]}>
            <boxGeometry args={[0.06, 0.04, 0.84]} />
            <meshStandardMaterial color="#252525" roughness={0.2} metalness={0.85} />
          </mesh>
        ))}

        {/* ── Glass side panels (transparent) ── */}
        {/* Left glass panel */}
        <mesh position={[-0.92, 0, 0]}>
          <boxGeometry args={[0.02, 3.3, 0.78]} />
          <meshStandardMaterial color="#1a3040" roughness={0.05} metalness={0.1} transparent opacity={0.15} />
        </mesh>
        {/* Right glass panel */}
        <mesh position={[0.92, 0, 0]}>
          <boxGeometry args={[0.02, 3.3, 0.78]} />
          <meshStandardMaterial color="#1a3040" roughness={0.05} metalness={0.1} transparent opacity={0.15} />
        </mesh>
        {/* Back panel — slightly more opaque mesh */}
        <mesh position={[0, 0, -0.42]}>
          <boxGeometry args={[1.78, 3.3, 0.02]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} metalness={0.4} transparent opacity={0.4} />
        </mesh>

        {/* ── Top panel — perforated ── */}
        <mesh position={[0, 1.71, 0]}>
          <boxGeometry args={[1.82, 0.02, 0.82]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* ── Rack rails (inner) ── */}
        {[-0.75, 0.75].map((x, i) => (
          <mesh key={`innerrail-${i}`} position={[x, 0, 0.35]}>
            <boxGeometry args={[0.03, 3.2, 0.02]} />
            <meshStandardMaterial color="#333" roughness={0.2} metalness={0.85} />
          </mesh>
        ))}

        {/* ── Server units (6 units) — properly mounted to rails ── */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = 1.3 - i * 0.48;
          return (
            <group key={i} position={[0, y, 0.1]}>
              {/* Server body — sits between rails */}
              <RoundedBox args={[1.45, 0.36, 0.6]} radius={0.01}>
                <meshStandardMaterial color={i % 2 === 0 ? "#161616" : "#1a1a1a"} roughness={0.35} metalness={0.75} />
              </RoundedBox>
              {/* Front face plate */}
              <mesh position={[0, 0, 0.31]}>
                <planeGeometry args={[1.42, 0.33]} />
                <meshStandardMaterial color="#131313" roughness={0.4} metalness={0.65} />
              </mesh>
              {/* Vent perforation */}
              {Array.from({ length: 8 }).map((_, v) => (
                <mesh key={v} position={[0.15 + v * 0.1, 0, 0.315]}>
                  <planeGeometry args={[0.04, 0.2]} />
                  <meshStandardMaterial color="#0b0b0b" roughness={0.9} />
                </mesh>
              ))}
              {/* Status LEDs — green + amber/blue */}
              <mesh ref={(el) => setLedRef(el, i * 2)} position={[-0.62, 0.06, 0.315]}>
                <sphereGeometry args={[0.018, 10, 10]} />
                <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} toneMapped={false} />
              </mesh>
              <mesh ref={(el) => setLedRef(el, i * 2 + 1)} position={[-0.62, -0.04, 0.315]}>
                <sphereGeometry args={[0.018, 10, 10]} />
                <meshStandardMaterial
                  color={i === 3 ? "#f59e0b" : i === 5 ? "#3b82f6" : "#00ffaa"}
                  emissive={i === 3 ? "#f59e0b" : i === 5 ? "#3b82f6" : "#00ffaa"}
                  emissiveIntensity={1}
                  toneMapped={false}
                />
              </mesh>
              {/* Drive handle */}
              <mesh position={[-0.52, 0, 0.315]}>
                <boxGeometry args={[0.04, 0.16, 0.008]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.85} />
              </mesh>
              {/* Mounting ears (attach to rails) */}
              {[-0.74, 0.74].map((mx, mi) => (
                <mesh key={`ear-${mi}`} position={[mx, 0, 0.34]}>
                  <boxGeometry args={[0.04, 0.32, 0.02]} />
                  <meshStandardMaterial color="#282828" roughness={0.25} metalness={0.8} />
                </mesh>
              ))}
              {/* Ear screws */}
              {[-0.74, 0.74].map((mx) =>
                [-0.1, 0.1].map((my, si) => (
                  <mesh key={`screw-${mx}-${si}`} position={[mx, my, 0.352]}>
                    <cylinderGeometry args={[0.008, 0.008, 0.005, 6]} />
                    <meshStandardMaterial color="#555" roughness={0.2} metalness={0.9} />
                  </mesh>
                ))
              )}
            </group>
          );
        })}

        {/* ── Internal cables (visible through glass) ── */}
        {cables.map((cable, ci) => {
          // Render each cable as a series of connected cylinders
          return cable.points.slice(0, -1).map((pt, pi) => {
            const next = cable.points[pi + 1];
            const dx = next[0] - pt[0];
            const dy = next[1] - pt[1];
            const dz = next[2] - pt[2];
            const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const midX = (pt[0] + next[0]) / 2;
            const midY = (pt[1] + next[1]) / 2;
            const midZ = (pt[2] + next[2]) / 2;
            // Direction angles
            const rotX = Math.atan2(dz, dy);
            const rotZ = Math.atan2(dx, Math.sqrt(dy * dy + dz * dz));
            return (
              <mesh key={`cable-${ci}-${pi}`} position={[midX, midY, midZ]} rotation={[rotX, 0, -rotZ]}>
                <cylinderGeometry args={[0.012, 0.012, len, 4]} />
                <meshStandardMaterial color={cable.color} roughness={0.6} metalness={0.15} />
              </mesh>
            );
          });
        })}

        {/* ── Cable management clips on back ── */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`clip-${i}`} position={[-0.5, 1.1 - i * 0.55, -0.32]}>
            <boxGeometry args={[0.3, 0.04, 0.04]} />
            <meshStandardMaterial color="#333" roughness={0.3} metalness={0.7} />
          </mesh>
        ))}

        {/* ── Power distribution unit (vertical on back-right) ── */}
        <mesh position={[0.6, 0, -0.3]}>
          <boxGeometry args={[0.08, 2.8, 0.08]} />
          <meshStandardMaterial color="#222" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* PDU outlets */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`outlet-${i}`} position={[0.6, 1.1 - i * 0.32, -0.26]}>
            <boxGeometry args={[0.05, 0.06, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
          </mesh>
        ))}
        {/* PDU power LED */}
        <mesh position={[0.6, 1.35, -0.26]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={3} toneMapped={false} />
        </mesh>

        {/* ── Interior glow ── */}
        <pointLight position={[0, 0, 0]} intensity={0.15} color="#00ffaa" distance={3} />
        <pointLight position={[0, 0, 0.8]} intensity={0.3} color="#00ffaa" distance={4} />
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

  const getSlidePositions = (slide: StorySlide, idx: number) => {
    if (!isMobile) return { pos: slide.cameraPos, look: slide.cameraLookAt };
    const mobilePositions: [number, number, number][] = [
      [0, 0.3, 5],
      [2, 0.5, 5],
      [-2, 0, 5],
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
  const slideDuration = slideEnd - slideStart;
  const fadeInRange = slideDuration * 0.12;
  // Text stays visible until 85% of the slide, then swooshes out in the last 15%
  const exitStart = slideEnd - slideDuration * 0.15;

  let opacity = 0;
  let exitProgress = 0; // 0 = fully visible, 1 = fully exited

  if (progress >= slideStart && progress <= slideEnd) {
    if (progress < slideStart + fadeInRange) {
      // Fade in
      opacity = (progress - slideStart) / fadeInRange;
    } else if (progress > exitStart) {
      // Swoosh exit phase
      opacity = 1;
      exitProgress = (progress - exitStart) / (slideEnd - exitStart);
    } else {
      opacity = 1;
    }
  }
  opacity = Math.max(0, Math.min(1, opacity));
  exitProgress = Math.max(0, Math.min(1, exitProgress));

  // Swoosh: accelerating curve for a snappy exit
  const easedExit = exitProgress * exitProgress * exitProgress;
  const swooshY = easedExit * 300;
  const swooshScale = 1 - easedExit * 0.3;
  const swooshOpacity = opacity * (1 - exitProgress * exitProgress);
  const swooshRotate = easedExit * 4; // subtle tilt

  // Entry: slide up
  const entryY = opacity < 1 && exitProgress === 0 ? (1 - opacity) * 40 : 0;

  const isRight = index === 1;

  return (
    <div
      className="absolute inset-0 flex items-end sm:items-center z-20 pointer-events-none px-5 sm:px-8 md:px-20 pb-24 sm:pb-0"
      style={{
        opacity: swooshOpacity,
        transform: `translateY(${entryY + swooshY}px) scale(${swooshScale}) rotate(${swooshRotate}deg)`,
        transformOrigin: "center bottom",
        transition: "none",
      }}
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

        {/* Scroll indicator — glitch-blur dissolve */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: progress < 0.02 ? 1 : progress < 0.12 ? 1 : 0,
            filter: progress < 0.02 ? "blur(0px)" : progress < 0.12 ? `blur(${((progress - 0.02) / 0.1) * 20}px)` : "blur(20px)",
            scale: progress < 0.02 ? 1 : progress < 0.12 ? 1 + ((progress - 0.02) / 0.1) * 0.6 : 1.6,
            letterSpacing: progress < 0.02 ? "0.25em" : progress < 0.12 ? `${0.25 + ((progress - 0.02) / 0.1) * 1.5}em` : "1.75em",
          }}
          transition={{ duration: 0.1, ease: "linear" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground font-mono">
            Just scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/60">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScrollStory;
