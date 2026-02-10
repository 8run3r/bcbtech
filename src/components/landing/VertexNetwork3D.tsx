import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

/* ─── Vertex Node (small glowing sphere) ─── */
const VertexNode = ({ position, label }: { position: [number, number, number]; label: string }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = position[0] + Math.sin(t * 0.3 + position[1]) * 0.15;
    ref.current.position.y = position[1] + Math.cos(t * 0.4 + position[0]) * 0.12;
    ref.current.position.z = position[2] + Math.sin(t * 0.2 + position[2]) * 0.1;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshStandardMaterial
        color="#00ffaa"
        emissive="#00ffaa"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
};

/* ─── Connecting Lines between vertices ─── */
const ConnectionLines = ({
  nodes,
  maxDistance,
}: {
  nodes: [number, number, number][];
  maxDistance: number;
}) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const positionsRef = useRef(new Float32Array(nodes.length * 3));
  const colorsRef = useRef(new Float32Array(0));

  // Precompute pairs
  const pairs = useMemo(() => {
    const p: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        p.push([i, j]);
      }
    }
    return p;
  }, [nodes.length]);

  // Initialize geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(pairs.length * 6);
    const colors = new Float32Array(pairs.length * 6);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    colorsRef.current = colors;
    return geo;
  }, [pairs.length]);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = geometry.getAttribute("color") as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;

    // Update node positions
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      positionsRef.current[i * 3] = n[0] + Math.sin(t * 0.3 + n[1]) * 0.15;
      positionsRef.current[i * 3 + 1] = n[1] + Math.cos(t * 0.4 + n[0]) * 0.12;
      positionsRef.current[i * 3 + 2] = n[2] + Math.sin(t * 0.2 + n[2]) * 0.1;
    }

    let visibleLines = 0;
    for (let p = 0; p < pairs.length; p++) {
      const [i, j] = pairs[p];
      const ax = positionsRef.current[i * 3];
      const ay = positionsRef.current[i * 3 + 1];
      const az = positionsRef.current[i * 3 + 2];
      const bx = positionsRef.current[j * 3];
      const by = positionsRef.current[j * 3 + 1];
      const bz = positionsRef.current[j * 3 + 2];

      const dx = ax - bx;
      const dy = ay - by;
      const dz = az - bz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const idx = p * 6;
      if (dist < maxDistance) {
        const alpha = 1 - dist / maxDistance;
        pos[idx] = ax;
        pos[idx + 1] = ay;
        pos[idx + 2] = az;
        pos[idx + 3] = bx;
        pos[idx + 4] = by;
        pos[idx + 5] = bz;
        // Green-ish color with alpha fade
        col[idx] = 0;
        col[idx + 1] = alpha * 0.9;
        col[idx + 2] = alpha * 0.6;
        col[idx + 3] = 0;
        col[idx + 4] = alpha * 0.9;
        col[idx + 5] = alpha * 0.6;
        visibleLines++;
      } else {
        // Hide by zeroing
        pos[idx] = pos[idx + 1] = pos[idx + 2] = 0;
        pos[idx + 3] = pos[idx + 4] = pos[idx + 5] = 0;
        col[idx] = col[idx + 1] = col[idx + 2] = 0;
        col[idx + 3] = col[idx + 4] = col[idx + 5] = 0;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.6} toneMapped={false} />
    </lineSegments>
  );
};

/* ─── Label sprites near nodes ─── */
const NodeLabel = ({ position, text }: { position: [number, number, number]; text: string }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = position[0] + Math.sin(t * 0.3 + position[1]) * 0.15 + 0.08;
    ref.current.position.y = position[1] + Math.cos(t * 0.4 + position[0]) * 0.12 + 0.08;
    ref.current.position.z = position[2] + Math.sin(t * 0.2 + position[2]) * 0.1;
  });

  // Create canvas texture for text
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 128, 64);
    ctx.font = "bold 28px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 64, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text]);

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[0.3, 0.15]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
};

/* ─── Floating 3D Objects (rounded cubes like igloo.inc) ─── */
const FloatingBlock = ({
  position,
  scale,
  rotationSpeed,
}: {
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * rotationSpeed * 0.3;
    ref.current.rotation.y = t * rotationSpeed * 0.2;
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale} castShadow>
        <boxGeometry args={[1, 0.7, 1, 4, 4, 4]} />
        <meshStandardMaterial
          color="#e8e8e8"
          roughness={0.15}
          metalness={0.1}
          envMapIntensity={0.8}
        />
      </mesh>
    </Float>
  );
};

/* ─── Scene ─── */
const Scene = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate vertex node positions
  const nodes = useMemo<[number, number, number][]>(
    () => [
      [-1.8, 1.2, -0.5],
      [-0.6, 1.5, 0.3],
      [0.8, 1.3, -0.2],
      [1.9, 0.9, 0.4],
      [-1.5, 0, 0.2],
      [-0.3, 0.2, -0.4],
      [0.5, -0.1, 0.5],
      [1.6, 0.3, -0.3],
      [-1.2, -1.2, -0.3],
      [-0.1, -1.0, 0.2],
      [1.0, -1.3, -0.1],
      [2.0, -0.8, 0.3],
      [-0.8, 0.7, 0.6],
      [0.2, 0.8, -0.5],
      [1.3, -0.5, 0.4],
      [-1.0, -0.5, 0.5],
      [0.7, 0.5, 0.3],
    ],
    []
  );

  const labels = ["78", "67", "85", "61", "57", "92", "43", "76", "88", "51", "64", "73", "69", "54", "82", "47", "71"];

  useFrame(({ mouse }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.15,
      0.03
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * 0.08,
      0.03
    );
  });

  return (
    <group ref={groupRef}>
      {/* Vertex network */}
      <ConnectionLines nodes={nodes} maxDistance={1.6} />
      {nodes.map((pos, i) => (
        <VertexNode key={i} position={pos} label={labels[i]} />
      ))}
      {/* Show labels on ~8 nodes */}
      {nodes.filter((_, i) => i % 2 === 0).map((pos, i) => (
        <NodeLabel key={`l-${i}`} position={pos} text={labels[i * 2]} />
      ))}

      {/* Floating 3D blocks (igloo-style) */}
      <FloatingBlock position={[-2.2, 0.8, -1.5]} scale={0.5} rotationSpeed={0.4} />
      <FloatingBlock position={[2.0, -0.5, -2.0]} scale={0.7} rotationSpeed={0.3} />
      <FloatingBlock position={[0, 1.5, -2.5]} scale={0.6} rotationSpeed={0.35} />
      <FloatingBlock position={[-1.0, -1.5, -1.8]} scale={0.45} rotationSpeed={0.5} />
      <FloatingBlock position={[1.5, 1.0, -1.2]} scale={0.35} rotationSpeed={0.45} />
      <FloatingBlock position={[-0.5, 0.0, -2.8]} scale={0.8} rotationSpeed={0.25} />
      <FloatingBlock position={[0.8, -1.2, -1.0]} scale={0.4} rotationSpeed={0.55} />
    </group>
  );
};

/* ─── Main Component ─── */
const VertexNetwork3D = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#00ffaa" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#00ffaa" />
        <fog attach="fog" args={["#0a0d10", 3, 9]} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default VertexNetwork3D;
